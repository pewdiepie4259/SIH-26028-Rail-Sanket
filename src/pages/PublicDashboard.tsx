import { useEffect, useState } from "react"
import { Search, MapPin, TrainFront } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AlertMarquee from "../components/AlertMarquee"

interface RailwayStation {
  name: string
  code: string
  latitude: number
  longitude: number
  image: string
}

interface Train {
  name: string
  number: string
  scheduledDeparture: string
  scheduledArrival: string
  from: string
  to: string
  lastStation: string
  // Stations where this train stops or passes through in our corridor
  servingStations: string[]
  nextStationCode: string
}

const defaultStation: RailwayStation = {
  name: "KSR Bengaluru Railway Station",
  code: "SBC",
  latitude: 12.9775,
  longitude: 77.5713,
  image:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/KSR%20Bengaluru%20Railway%20Station.jpg",
}

const bengaluruStations: RailwayStation[] = [
  {
    name: "KSR Bengaluru Railway Station",
    code: "SBC",
    latitude: 12.9775,
    longitude: 77.5713,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/KSR%20Bengaluru%20Railway%20Station.jpg",
  },
  {
    name: "Yesvantpur Junction",
    code: "YPR",
    latitude: 13.028,
    longitude: 77.5547,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Yesvantpur%20Junction%20railway%20station%20%28Sept%20%2723%29.jpg",
  },
  {
    name: "Bengaluru Cantonment Railway Station",
    code: "BNC",
    latitude: 12.9937,
    longitude: 77.598,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangalore_Cantonment_railway_station.jpg",
  },
  {
    name: "Bengaluru East Railway Station",
    code: "BNCE",
    latitude: 13.0007,
    longitude: 77.6171,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangalore_East_railway_station.jpg",
  },
  {
    name: "Baiyappanahalli Railway Station",
    code: "BYPL",
    latitude: 13.0285,
    longitude: 77.6328,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Baiyappanahalli_railway_station.jpg",
  },
  {
    name: "Krishnarajapuram Railway Station",
    code: "KJM",
    latitude: 13.0006,
    longitude: 77.676,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Krishnarajapuram_railway_station.jpg",
  },
  {
    name: "Kengeri Railway Station",
    code: "KGI",
    latitude: 12.916844,
    longitude: 77.483789,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kengeri%20Railway%20Station.jpg",
  },
]

// All trains with the stations they connect to in Bengaluru cluster
const allTrains: Train[] = [
  {
    name: "Karnataka Express",
    number: "12627",
    scheduledDeparture: "19:20",
    scheduledArrival: "06:15",
    from: "KSR Bengaluru",
    to: "New Delhi",
    lastStation: "Kengeri",
    servingStations: ["SBC", "KGI", "BNC"],
    nextStationCode: "KGI",
  },
  {
    name: "Bengaluru - Mysuru Express",
    number: "12613",
    scheduledDeparture: "06:15",
    scheduledArrival: "08:45",
    from: "KSR Bengaluru",
    to: "Mysuru",
    lastStation: "KSR Bengaluru",
    servingStations: ["SBC", "KGI"],
    nextStationCode: "KGI",
  },
  {
    name: "Brindavan Express",
    number: "12639",
    scheduledDeparture: "07:00",
    scheduledArrival: "13:40",
    from: "KSR Bengaluru",
    to: "Chennai Central",
    lastStation: "Bengaluru Cantonment",
    servingStations: ["SBC", "BNC", "KJM"],
    nextStationCode: "BNC",
  },
  {
    name: "Mysuru - Chennai Express",
    number: "12610",
    scheduledDeparture: "22:15",
    scheduledArrival: "05:30",
    from: "Mysuru",
    to: "Chennai Central",
    lastStation: "Mandya",
    servingStations: ["SBC", "BNC", "KGI"],
    nextStationCode: "BNC",
  },
  {
    name: "Lalbagh Express",
    number: "12608",
    scheduledDeparture: "06:20",
    scheduledArrival: "12:35",
    from: "KSR Bengaluru",
    to: "Chennai Central",
    lastStation: "Bengaluru East",
    servingStations: ["SBC", "BNC", "BNCE", "KJM"],
    nextStationCode: "BNCE",
  },
  {
    name: "Hampi Express",
    number: "16591",
    scheduledDeparture: "21:00",
    scheduledArrival: "08:10",
    from: "KSR Bengaluru",
    to: "Hubballi",
    lastStation: "Yelahanka",
    servingStations: ["YPR", "SBC", "KGI"],
    nextStationCode: "SBC",
  },
]

function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371

  const latitudeDifference = ((latitude2 - latitude1) * Math.PI) / 180
  const longitudeDifference = ((longitude2 - longitude1) * Math.PI) / 180

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos((latitude1 * Math.PI) / 180) *
    Math.cos((latitude2 * Math.PI) / 180) *
    Math.sin(longitudeDifference / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadius * c
}

function PublicDashboard() {
  const navigate = useNavigate()
  const [station, setStation] = useState<RailwayStation>(defaultStation)
  const [locationStatus, setLocationStatus] = useState("Locating...")
  const [searchQuery, setSearchQuery] = useState("")

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

        const bengaluruCoverageRadius = 45

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

  // Filter 1: First filter by Nearest Detected Station
  const stationFilteredTrains = allTrains.filter((train) =>
    train.servingStations.includes(station.code)
  )

  // Fallback: If no trains serve that specific station, show all trains
  const displayedTrains =
    stationFilteredTrains.length > 0 ? stationFilteredTrains : allTrains

  // Filter 2: Then filter by user search query (if typed)
  const finalTrains = displayedTrains.filter(
    (train) =>
      train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.number.includes(searchQuery) ||
      train.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.to.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTrackETA = (train: Train) => {
    // Dynamic routing: starts from the nearest detected station!
    const fromCode = station.code
    const toCode = train.nextStationCode === fromCode ? "SBC" : train.nextStationCode

    navigate(`/live-train-status?train=${train.number}&from=${fromCode}&to=${toCode}`)
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <section className="relative h-[40vh] min-h-[300px] max-h-[420px] overflow-hidden">
        <img
          src={station.image}
          alt={station.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#031426]/95 via-[#06283B]/70 to-[#031426]/40" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-6 py-7 lg:px-12">
          <div className="max-w-3xl pt-2">
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B] sm:text-sm">
              Welcome to
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Rail<span className="text-[#F59E0B]">Drishti</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#D7E5EC] sm:text-base">
              Dynamic Estimated Time of Arrival System For Indian Coaching Trains.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-[#DDE9EF] sm:text-sm">
              <MapPin size={16} className="text-[#F59E0B]" />
              <span>
                {locationStatus}: <strong className="text-white">{station.name} ({station.code})</strong>
              </span>
            </div>
          </div>

          <div className="w-full max-w-5xl">
            <div className="mb-2 text-xs font-semibold text-white sm:text-sm">
              Search trains, stations or train numbers
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl sm:flex-row">
              <div className="flex min-h-[52px] flex-1 items-center gap-3 px-4 sm:px-5">
                <Search size={20} className="shrink-0 text-[#0E7C86]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-[#D0DEE5] sm:text-xs">
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => navigate('/live-train-status')}>
                <TrainFront size={14} className="text-[#F59E0B]" />
                Live train status
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                Predictive ETA
              </span>
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => navigate('/map')}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                Live tracking
              </span>
            </div>
          </div>
        </div>
      </section>

      <AlertMarquee />

      <section className="bg-gradient-to-br from-[#D6E7EC] via-[#F4F7FA] to-[#BFDDE0]">
        <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-12">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
                Live Network • Serving {station.name}
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#071A33] sm:text-3xl">
                Trains on the Move
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Showing trains available through or near <strong>{station.name}</strong>.
              </p>
            </div>

            {/* Quick Station Switcher Pill */}
            <div className="text-xs bg-white/70 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 font-medium">
              Station Code: <span className="font-bold text-[#0E7C86]">{station.code}</span>
            </div>
          </div>

          <div className="space-y-4">
            {finalTrains.map((train) => (
              <div
                key={train.number}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-[#F59E0B]/60 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-[#071A33] transition-colors duration-300 group-hover:text-[#0E7C86]">
                        {train.name}
                      </h3>
                      <span className="rounded-md bg-[#F59E0B] px-2.5 py-1 text-xs font-bold text-[#071A33]">
                        {train.number}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Scheduled
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {train.scheduledDeparture} → {train.scheduledArrival}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Route
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {train.from} → {train.to}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Last Station
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {train.lastStation}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Status
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500 transition-transform duration-300 group-hover:scale-125" />
                          <span className="text-sm font-semibold text-slate-700">
                            Running
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTrackETA(train)}
                    className="flex h-11 shrink-0 items-center justify-center rounded-lg border border-[#0E7C86] bg-[#0E7C86] px-5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#0B6972] hover:shadow-[0_6px_20px_rgba(14,124,134,0.3)] lg:min-w-[135px]"
                  >
                    Track ETA
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {finalTrains.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 font-medium">
                No trains found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default PublicDashboard