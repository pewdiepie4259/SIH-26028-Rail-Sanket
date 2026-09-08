import { useEffect, useState } from "react"
import { Search, MapPin, TrainFront } from "lucide-react"
import AlertMarquee from "../components/AlertMarquee"

interface RailwayStation {
  name: string
  latitude: number
  longitude: number
  image: string
}

const defaultStation: RailwayStation = {
  name: "KSR Bengaluru Railway Station",
  latitude: 12.9775,
  longitude: 77.5713,
  image:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/KSR%20Bengaluru%20Railway%20Station.jpg",
}

const bengaluruStations: RailwayStation[] = [
  {
    name: "KSR Bengaluru Railway Station",
    latitude: 12.9775,
    longitude: 77.5713,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/KSR%20Bengaluru%20Railway%20Station.jpg",
  },
  {
    name: "Yesvantpur Junction",
    latitude: 13.028,
    longitude: 77.5547,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Yesvantpur%20Junction%20railway%20station%20%28Sept%20%2723%29.jpg",
  },
  {
    name: "Bengaluru Cantonment Railway Station",
    latitude: 12.9937,
    longitude: 77.598,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangalore_Cantonment_railway_station.jpg",
  },
  {
    name: "Bengaluru East Railway Station",
    latitude: 13.0007,
    longitude: 77.6171,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangalore_East_railway_station.jpg",
  },
  {
    name: "Baiyappanahalli Railway Station",
    latitude: 13.0285,
    longitude: 77.6328,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Baiyappanahalli_railway_station.jpg",
  },
  {
    name: "Krishnarajapuram Railway Station",
    latitude: 13.0006,
    longitude: 77.676,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Krishnarajapuram_railway_station.jpg",
  },
  {
    name: "Kengeri Railway Station",
    latitude: 12.916844,
    longitude: 77.483789,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kengeri%20Railway%20Station.jpg",
  },
]

function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371

  const latitudeDifference =
    ((latitude2 - latitude1) * Math.PI) / 180

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadius * c
}

function PublicDashboard() {
  const [station, setStation] = useState(defaultStation)
  const [locationStatus, setLocationStatus] = useState("Locating...")

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Location unavailable")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        const bengaluruCenter = {
          latitude: 12.9716,
          longitude: 77.5946,
        }

        const distanceFromBengaluru = calculateDistance(
          latitude,
          longitude,
          bengaluruCenter.latitude,
          bengaluruCenter.longitude
        )

        const bengaluruCoverageRadius = 35

        if (distanceFromBengaluru > bengaluruCoverageRadius) {
          setStation(defaultStation)
          setLocationStatus("Bengaluru")
          return
        }

        let nearestStation = bengaluruStations[0]
        let shortestDistance = Infinity

        bengaluruStations.forEach((railwayStation) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            railwayStation.latitude,
            railwayStation.longitude
          )

          if (distance < shortestDistance) {
            shortestDistance = distance
            nearestStation = railwayStation
          }
        })

        setStation(nearestStation)
        setLocationStatus("Nearest railway station")
      },
      () => {
        setStation(defaultStation)
        setLocationStatus("Bengaluru")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <section className="relative h-[40vh] min-h-[300px] max-h-[420px] overflow-hidden">
        <img
          src={station.image}
          alt={station.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#031426]/90 via-[#06283B]/65 to-[#031426]/35" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-6 py-7 lg:px-12">
          <div className="max-w-3xl pt-2">
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#55D6D1] sm:text-sm">
              Welcome to
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              RailDrishti
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#D7E5EC] sm:text-base">
              Dynamic Estimated Time of Arrival System For Indian Coaching Trains.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-[#B8CBD6] sm:text-sm">
              <MapPin size={15} />
              <span>
                {locationStatus}: {station.name}
              </span>
            </div>
          </div>

          <div className="w-full max-w-5xl">
            <div className="mb-2 text-xs font-semibold text-white sm:text-sm">
              Search trains, stations or train numbers
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl sm:flex-row">
              <div className="flex min-h-[52px] flex-1 items-center gap-3 px-4 sm:px-5">
                <Search
                  size={20}
                  className="shrink-0 text-[#0E7C86]"
                />

                <input
                  type="text"
                  placeholder="Search train number, train name or station..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 sm:text-base"
                />
              </div>

              <button
                type="button"
                className="flex min-h-[52px] items-center justify-center gap-2 bg-[#0E7C86] px-6 text-sm font-semibold text-white transition hover:bg-[#0B6972] sm:px-7"
              >
                <Search size={17} />
                Search
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#D0DEE5] sm:text-xs">
              <span className="flex items-center gap-1.5">
                <TrainFront size={13} />
                Live train status
              </span>

              <span>Predictive ETA</span>
              <span>Network conditions</span>
            </div>
          </div>
        </div>
      </section>

      <AlertMarquee />

      <section className="mx-auto max-w-[1600px] px-6 py-7 lg:px-12">
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
            Live Network
          </div>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#071A33] sm:text-3xl">
            Railway Network Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Real-time train movement, delays and network conditions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Live Network
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <p className="text-xl font-bold text-[#071A33]">
                Operational
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Train Movements
            </p>

            <p className="mt-2 text-2xl font-bold text-[#071A33]">
              1,248
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              On-Time Services
            </p>

            <p className="mt-2 text-2xl font-bold text-[#071A33]">
              87%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Alerts
            </p>

            <p className="mt-2 text-2xl font-bold text-[#071A33]">
              3
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PublicDashboard