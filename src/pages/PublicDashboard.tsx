import { useEffect, useState } from "react"
import { Search, MapPin, TrainFront } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AlertMarquee from "../components/AlertMarquee"
import ETAFragment, { type ETATrain } from "../components/ETAFragment"
import { WhatsAppChatModal } from "../components/WhatsAppChatModal"

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
  servingStations: string[]
  nextStationCode: string
}

interface RecentSearch {
  name: string
  number: string
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

const allTrains: Train[] = [
  {
    name: "Karnataka Express",
    number: "12627",
    scheduledDeparture: "19:20",
    scheduledArrival: "06:15",
    from: "KSR Bengaluru",
    to: "New Delhi",
    lastStation: "Kengeri",
    servingStations: ["SBC", "KGI", "BNC", "YPR"],
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

const recentSearches: RecentSearch[] = [
  {
    name: "Karnataka Express",
    number: "12627",
  },
  {
    name: "Brindavan Express",
    number: "12639",
  },
  {
    name: "Lalbagh Express",
    number: "12608",
  },
]

const etaData: Record<string, ETATrain> = {
  "12627": {
    name: "Karnataka Express",
    number: "12627",
    scheduledDeparture: "19:20",
    scheduledArrival: "06:15",
    predictedArrival: "06:33",
    from: "KSR Bengaluru",
    to: "New Delhi",
    lastStation: "Kengeri",
    currentLocation: "Kengeri",
    delayMinutes: 18,
    progress: 24,
    stations: [
      "KSR Bengaluru",
      "Kengeri",
      "Tumakuru",
      "Guntakal",
      "New Delhi",
    ],
  },
  "12613": {
    name: "Bengaluru - Mysuru Express",
    number: "12613",
    scheduledDeparture: "06:15",
    scheduledArrival: "08:45",
    predictedArrival: "08:45",
    from: "KSR Bengaluru",
    to: "Mysuru",
    lastStation: "KSR Bengaluru",
    currentLocation: "KSR Bengaluru",
    delayMinutes: 0,
    progress: 8,
    stations: [
      "KSR Bengaluru",
      "Kengeri",
      "Mandya",
      "Mysuru",
    ],
  },
  "12639": {
    name: "Brindavan Express",
    number: "12639",
    scheduledDeparture: "07:00",
    scheduledArrival: "13:40",
    predictedArrival: "13:52",
    from: "KSR Bengaluru",
    to: "Chennai Central",
    lastStation: "Bengaluru Cantonment",
    currentLocation: "Bengaluru Cantonment",
    delayMinutes: 12,
    progress: 17,
    stations: [
      "KSR Bengaluru",
      "Bengaluru Cantonment",
      "Krishnarajapuram",
      "Jolarpettai",
      "Chennai Central",
    ],
  },
  "12610": {
    name: "Mysuru - Chennai Express",
    number: "12610",
    scheduledDeparture: "22:15",
    scheduledArrival: "05:30",
    predictedArrival: "05:30",
    from: "Mysuru",
    to: "Chennai Central",
    lastStation: "Mandya",
    currentLocation: "Mandya",
    delayMinutes: 0,
    progress: 21,
    stations: [
      "Mysuru",
      "Mandya",
      "Bengaluru",
      "Jolarpettai",
      "Chennai Central",
    ],
  },
  "12608": {
    name: "Lalbagh Express",
    number: "12608",
    scheduledDeparture: "06:20",
    scheduledArrival: "12:35",
    predictedArrival: "12:48",
    from: "KSR Bengaluru",
    to: "Chennai Central",
    lastStation: "Bengaluru East",
    currentLocation: "Bengaluru East",
    delayMinutes: 13,
    progress: 14,
    stations: [
      "KSR Bengaluru",
      "Bengaluru East",
      "Krishnarajapuram",
      "Jolarpettai",
      "Chennai Central",
    ],
  },
  "16591": {
    name: "Hampi Express",
    number: "16591",
    scheduledDeparture: "21:00",
    scheduledArrival: "08:10",
    predictedArrival: "08:10",
    from: "KSR Bengaluru",
    to: "Hubballi",
    lastStation: "Yelahanka",
    currentLocation: "Yelahanka",
    delayMinutes: 0,
    progress: 19,
    stations: [
      "KSR Bengaluru",
      "Yelahanka",
      "Chikballapur",
      "Hospet",
      "Hubballi",
    ],
  },
}

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
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null)

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

  const stationFilteredTrains = allTrains.filter((train) =>
    train.servingStations.includes(station.code)
  )

  const displayedTrains =
    stationFilteredTrains.length > 0 ? stationFilteredTrains : allTrains

  // Multi-term search logic (tolerant to combined train name and number)
  const searchTokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)

  const finalTrains = displayedTrains.filter((train) => {
    if (searchTokens.length === 0) return true
    const targetStr = `${train.name} ${train.number} ${train.from} ${train.to} ${train.lastStation}`.toLowerCase()
    return searchTokens.every((token) => targetStr.includes(token))
  })

  const handleRecentSearch = (search: RecentSearch) => {
    setSearchQuery(`${search.name} ${search.number}`)
  }

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      setSelectedTrain(null)
      return
    }

    const matchedTrain = allTrains.find((train) => {
      const targetStr = `${train.name} ${train.number} ${train.from} ${train.to} ${train.lastStation}`.toLowerCase()
      return searchTokens.every((token) => targetStr.includes(token))
    })

    if (matchedTrain) {
      setSelectedTrain(matchedTrain)
    }
  }

  const handleTrackETA = (train: Train) => {
    if (etaData[train.number]) {
      setSelectedTrain(train)
    } else {
      const fromCode = station.code
      const toCode = train.nextStationCode === fromCode ? "SBC" : train.nextStationCode
      navigate(`/live-train-status?train=${train.number}&from=${fromCode}&to=${toCode}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <section className="relative min-h-[360px] overflow-hidden sm:min-h-[370px] lg:min-h-[380px]">
        <img
          src={station.image}
          alt={station.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#031426]/95 via-[#06283B]/75 to-[#031426]/60" />

        <div className="relative z-10 mx-auto flex min-h-[340px] max-w-[1600px] flex-col justify-center px-6 py-8 sm:min-h-[350px] lg:min-h-[360px] lg:px-12">
          {/* Hero Information & Search Bar */}
          <div className="w-full max-w-4xl">
            <div className="max-w-3xl pt-2">
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
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

            <div className="mt-6 w-full max-w-4xl">
              <div className="mb-2 text-xs font-semibold text-white sm:text-sm">
                Search trains, stations or train numbers
              </div>

              <div className="flex flex-col overflow-hidden rounded-xl border border-[#F59E0B] bg-white/95 shadow-2xl backdrop-blur-xl sm:flex-row">
                <div className="flex min-h-[52px] flex-1 items-center gap-3 px-4 sm:px-5">
                  <Search size={20} className="shrink-0 text-[#0E7C86]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value)
                      setSelectedTrain(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch()
                      }
                    }}
                    placeholder="Search train number, train name or station..."
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 sm:text-base"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex min-h-[52px] items-center justify-center gap-2 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_5px_14px_rgba(14,89,97,0.22)] sm:px-7"
                >
                  <Search size={17} />
                  Search
                </button>
              </div>

              <div className="mt-3">
                <div className="mb-2 text-[11px] font-semibold text-white sm:text-xs">
                  Recent Searches
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search.number}
                      type="button"
                      onClick={() => handleRecentSearch(search)}
                      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:border-[#F59E0B]/70 hover:bg-white/15"
                    >
                      <span>{search.name}</span>

                      <span className="rounded-full bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-bold text-[#071A33]">
                        {search.number}
                      </span>
                    </button>
                  ))}
                </div>
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
        </div>
      </section>

      <AlertMarquee />



      {selectedTrain && etaData[selectedTrain.number] ? (
        <div className="mx-auto max-w-[1600px] px-6 py-6 lg:px-12">
          <button
            onClick={() => setSelectedTrain(null)}
            className="mb-4 text-xs font-semibold text-[#0E7C86] hover:underline flex items-center gap-1"
          >
            ← Back to all trains
          </button>
          <ETAFragment train={etaData[selectedTrain.number]} />
        </div>
      ) : (
        <section className="bg-gradient-to-r from-[#FFF4E1] via-white to-[#FFF4E1]">
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
                      className="flex h-11 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_5px_14px_rgba(14,89,97,0.22)] lg:min-w-[135px]"
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
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm font-semibold text-[#071A33]">
                    No trains found matching "{searchQuery}"
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try searching by train number, train name or station.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Real-time WhatsApp Bot In-Browser Simulator */}
      <WhatsAppChatModal />
    </div>
  )
}

export default PublicDashboard