import logging
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from src.config import settings

logger = logging.getLogger("rail_drishti.db")

Base = declarative_base()

def get_configured_engine():
    db_url = settings.DATABASE_URL
    # If postgres, test if connection is actually reachable
    if db_url.startswith("postgresql"):
        try:
            test_engine = create_engine(
                db_url,
                pool_size=5,
                max_overflow=5,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3}
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected successfully to PostgreSQL database.")
            return test_engine
        except Exception as e:
            logger.warning(
                f"Could not connect to PostgreSQL ({e}). "
                "Falling back to local SQLite database for zero-config execution."
            )
            db_path = Path(__file__).resolve().parent.parent / "bengaluru_railway_eta.db"
            sqlite_url = f"sqlite:///{db_path}"
            return create_engine(sqlite_url, connect_args={"check_same_thread": False})
    
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False})
        
    return create_engine(db_url)

engine = get_configured_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Ensure all database tables exist and seed default corridor data if empty."""
    from src.models import Train
    from src.seeds import dev_seed
    
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        train_count = db.query(Train).count()
        if train_count == 0:
            logger.info("Database is unseeded. Running dev_seed to populate stations & trains...")
            dev_seed.run_seed()
    except Exception as e:
        logger.warning(f"Error during init_db: {e}")
    finally:
        db.close()