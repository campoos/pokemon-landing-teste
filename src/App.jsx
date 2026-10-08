import { useEffect, useMemo, useState } from 'react'

const formatLabel = (value) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const getTypeColor = (type) => {
  const colors = {
    normal: '#a8a77a',
    fire: '#ee8130',
    water: '#6390f0',
    electric: '#f7d02c',
    grass: '#7ac74c',
    ice: '#96d9d6',
    fighting: '#c22e28',
    poison: '#a33ea1',
    ground: '#e2bf65',
    flying: '#a98ff3',
    psychic: '#f95587',
    bug: '#a6b91a',
    rock: '#b6a136',
    ghost: '#735797',
    dragon: '#6f35fc',
    dark: '#705746',
    steel: '#b7b7ce',
    fairy: '#d685ad'
  }

  return colors[type] || '#7c7c7c'
}

function App() {
  const [pokemons, setPokemons] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFirstGeneration = async () => {
      try {
        setLoading(true)
        setError('')

        const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        if (!listResponse.ok) throw new Error('Erro ao buscar lista de Pokémon.')

        const listData = await listResponse.json()

        const detailPromises = listData.results.map(async (pokemon) => {
          const pokemonResponse = await fetch(pokemon.url)
          if (!pokemonResponse.ok) throw new Error(`Erro ao buscar ${pokemon.name}`)

          const pokemonData = await pokemonResponse.json()

          return {
            id: pokemonData.id,
            name: pokemonData.name,
            image:
              pokemonData.sprites.versions['generation-v']['black-white'].animated
                .front_default ||
              pokemonData.sprites.front_default ||
              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
            official:
              pokemonData.sprites.other['official-artwork'].front_default ||
              pokemonData.sprites.front_default ||
              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
            types: pokemonData.types.map((item) => item.type.name),
            height: pokemonData.height / 10,
            weight: pokemonData.weight / 10,
            abilities: pokemonData.abilities.map((item) => item.ability.name),
            stats: pokemonData.stats.map((item) => ({
              name: item.stat.name,
              value: item.base_stat
            })),
            moves: pokemonData.moves.slice(0, 5).map((item) => item.move.name)
          }
        })

        const results = await Promise.all(detailPromises)
        setPokemons(results)
        setSelectedPokemon(results[0])
      } catch (err) {
        setError('Não foi possível carregar os Pokémon. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchFirstGeneration()
  }, [])

  const selectedStats = useMemo(() => {
    if (!selectedPokemon) return []

    return selectedPokemon.stats.map((stat) => ({
      ...stat,
      fill:
        stat.name === 'hp'
          ? '#ff6b6b'
          : stat.name === 'attack'
            ? '#f7b267'
            : stat.name === 'defense'
              ? '#4ecdc4'
              : stat.name === 'special-attack'
                ? '#5b8def'
                : '#a78bfa'
    }))
  }, [selectedPokemon])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-mark">P</span>
          <div>
            <p className="eyebrow">Pokédex</p>
            <h1>Pokémon First Generation</h1>
          </div>
        </div>
      </header>

      <main className="content-grid">
        <section className="catalog-panel">
          <div className="section-heading">
            <h2>Escolha seu Pokémon</h2>
            <span>{pokemons.length} Pokémon</span>
          </div>

          {loading && <div className="status-box">Carregando Pokémon...</div>}
          {error && <div className="status-box error">{error}</div>}

          <div className="pokemon-grid">
            {!loading &&
              pokemons.map((pokemon) => (
                <button
                  type="button"
                  key={pokemon.id}
                  className={`pokemon-card ${selectedPokemon?.id === pokemon.id ? 'active' : ''}`}
                  onClick={() => setSelectedPokemon(pokemon)}
                >
                  <div className="card-id">#{String(pokemon.id).padStart(3, '0')}</div>
                  <img src={pokemon.image} alt={pokemon.name} className="pokemon-gif" />
                  <div className="card-name">{formatLabel(pokemon.name)}</div>
                  <div className="type-row">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="type-badge"
                        style={{ backgroundColor: getTypeColor(type) }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
          </div>
        </section>

        <aside className="details-panel">
          {selectedPokemon ? (
            <>
              <div className="detail-header">
                <div>
                  <p className="eyebrow">#{String(selectedPokemon.id).padStart(3, '0')}</p>
                  <h2>{formatLabel(selectedPokemon.name)}</h2>
                </div>
                <div className="type-row">
                  {selectedPokemon.types.map((type) => (
                    <span
                      key={type}
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="promo-art">
                <img src={selectedPokemon.official} alt={selectedPokemon.name} />
              </div>

              <div className="metrics-grid">
                <div className="metric-box">
                  <span>Altura</span>
                  <strong>{selectedPokemon.height} m</strong>
                </div>
                <div className="metric-box">
                  <span>Peso</span>
                  <strong>{selectedPokemon.weight} kg</strong>
                </div>
                <div className="metric-box">
                  <span>Habilidades</span>
                  <strong>{selectedPokemon.abilities.length}</strong>
                </div>
                <div className="metric-box">
                  <span>Movimentos</span>
                  <strong>{selectedPokemon.moves.length}</strong>
                </div>
              </div>

              <div className="info-block">
                <h3>Estatísticas</h3>
                <div className="stats-list">
                  {selectedStats.map((stat) => (
                    <div className="stat-row" key={stat.name}>
                      <span>{formatLabel(stat.name)}</span>
                      <div className="meter">
                        <div
                          className="meter-fill"
                          style={{
                            width: `${Math.min(stat.value, 100)}%`,
                            background: stat.fill
                          }}
                        />
                      </div>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-block">
                <h3>Habilidades</h3>
                <div className="chips-row">
                  {selectedPokemon.abilities.map((ability) => (
                    <span key={ability} className="chip">
                      {formatLabel(ability)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="info-block">
                <h3>Movimentos</h3>
                <div className="chips-row">
                  {selectedPokemon.moves.map((move) => (
                    <span key={move} className="chip dark-chip">
                      {formatLabel(move)}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="status-box">Selecione um Pokémon para ver os detalhes.</div>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App