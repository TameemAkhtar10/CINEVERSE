import React, { useState, useEffect, useCallback } from 'react'
import { getTrending, getMovieDetails, getMovieCredits, IMG } from '../api/tmdb'
import Footer from '../components/Footer'

const QUIZ_POOL_SIZE = 8

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function makeYearOptions(year) {
    const y = Number(year)
    const opts = shuffle([y - 2, y - 1, y, y + 1, y + 2]).slice(0, 4)
    if (!opts.includes(y)) opts[0] = y
    return shuffle(opts)
}

function makeRatingOptions(rating) {
    const r = Math.round(rating * 10) / 10
    const opts = shuffle([
        Math.max(1, +(r - 1).toFixed(1)),
        Math.max(1, +(r - 0.5).toFixed(1)),
        r,
        Math.min(10, +(r + 0.5).toFixed(1)),
        Math.min(10, +(r + 1).toFixed(1)),
    ].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4)
    if (!opts.includes(r)) opts[0] = r
    return shuffle(opts)
}

async function buildQuiz(movie, credits) {
    const director = credits?.crew?.find((c) => c.job === 'Director')
    const otherDirectors = ['Christopher Nolan', 'Quentin Tarantino', 'Steven Spielberg', 'Denis Villeneuve', 'Ridley Scott', 'Martin Scorsese']
    const year = (movie.release_date || '').slice(0, 4)
    const rating = movie.vote_average || 7
    const genre = movie.genres?.[0]?.name || null
    const allGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Animation', 'Thriller', 'Documentary']

    const questions = []

    if (year) {
        questions.push({
            text: `What year was "${movie.title}" released?`,
            options: makeYearOptions(year).map(String),
            answer: String(year),
            type: 'year',
        })
    }

    if (director) {
        const wrongDirs = shuffle(otherDirectors.filter((d) => d !== director.name)).slice(0, 3)
        questions.push({
            text: `Who directed "${movie.title}"?`,
            options: shuffle([director.name, ...wrongDirs]),
            answer: director.name,
            type: 'director',
        })
    }

    if (genre) {
        const wrongGenres = shuffle(allGenres.filter((g) => g !== genre)).slice(0, 3)
        questions.push({
            text: `What is the primary genre of "${movie.title}"?`,
            options: shuffle([genre, ...wrongGenres]),
            answer: genre,
            type: 'genre',
        })
    }

    questions.push({
        text: `What is the approximate rating of "${movie.title}" on TMDB?`,
        options: makeRatingOptions(rating).map(String),
        answer: String(Math.round(rating * 10) / 10),
        type: 'rating',
    })

    const lead = credits?.cast?.[0]
    if (lead) {
        const wrongCast = ['Tom Hanks', 'Meryl Streep', 'Leonardo DiCaprio', 'Cate Blanchett', 'Denzel Washington', 'Natalie Portman']
            .filter((n) => n !== lead.name)
        questions.push({
            text: `Who plays the lead role in "${movie.title}"?`,
            options: shuffle([lead.name, ...shuffle(wrongCast).slice(0, 3)]),
            answer: lead.name,
            type: 'cast',
        })
    }

    return shuffle(questions).slice(0, 4)
}

export default function Trivia() {
    const [pool, setPool] = useState([])
    const [movieIdx, setMovieIdx] = useState(0)
    const [quiz, setQuiz] = useState(null)
    const [currentQ, setCurrentQ] = useState(0)
    const [selected, setSelected] = useState(null)
    const [score, setScore] = useState(0)
    const [total, setTotal] = useState(0)
    const [finished, setFinished] = useState(false)
    const [loading, setLoading] = useState(true)
    const [buildingQuiz, setBuildingQuiz] = useState(false)

    useEffect(() => {
        getTrending('movie', 'week').then((res) => {
            setPool(shuffle(res.data.results || []).slice(0, QUIZ_POOL_SIZE))
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const loadMovieQuiz = useCallback(async (idx) => {
        const item = pool[idx]
        if (!item) return
        setBuildingQuiz(true)
        setQuiz(null); setCurrentQ(0); setSelected(null); setFinished(false)
        try {
            const [detRes, credRes] = await Promise.all([
                getMovieDetails(item.id),
                getMovieCredits(item.id),
            ])
            const qs = await buildQuiz(detRes.data, credRes.data)
            setQuiz({ movie: detRes.data, questions: qs })
        } finally {
            setBuildingQuiz(false)
        }
    }, [pool])

    useEffect(() => {
        if (pool.length) loadMovieQuiz(0)
    }, [pool])

    const handleAnswer = (option) => {
        if (selected !== null) return
        setSelected(option)
        const correct = option === quiz.questions[currentQ].answer
        if (correct) setScore((s) => s + 1)
        setTotal((t) => t + 1)
    }

    const nextQuestion = () => {
        if (currentQ < quiz.questions.length - 1) {
            setCurrentQ((q) => q + 1)
            setSelected(null)
        } else {
            setFinished(true)
        }
    }

    const nextMovie = () => {
        const next = (movieIdx + 1) % pool.length
        setMovieIdx(next)
        loadMovieQuiz(next)
    }

    const reset = () => { setScore(0); setTotal(0); setMovieIdx(0); loadMovieQuiz(0) }

    if (loading) return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    )

    const movie = quiz?.movie
    const question = quiz?.questions?.[currentQ]
    const poster = movie ? IMG(movie.poster_path, 'w342') : null

    return (
        <div className="min-h-screen bg-bg pt-20 pb-10">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">🎬 Movie Trivia</h1>
                    <p className="text-slate-400">Test your movie knowledge</p>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl px-5 py-2">
                            <div className="text-2xl font-bold text-indigo-400">{score}</div>
                            <div className="text-xs text-slate-400">Correct</div>
                        </div>
                        <div className="bg-card border border-white/10 rounded-xl px-5 py-2">
                            <div className="text-2xl font-bold text-white">{total}</div>
                            <div className="text-xs text-slate-400">Answered</div>
                        </div>
                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-5 py-2">
                            <div className="text-2xl font-bold text-amber-400">{total ? Math.round((score / total) * 100) : 0}%</div>
                            <div className="text-xs text-slate-400">Accuracy</div>
                        </div>
                    </div>
                </div>

                {buildingQuiz ? (
                    <div className="bg-card border border-white/10 rounded-2xl p-12 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400">Loading next movie…</p>
                    </div>
                ) : quiz && !finished ? (
                    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                        {poster && (
                            <div className="relative h-48 overflow-hidden">
                                <img src={poster} alt={movie.title} className="w-full h-full object-cover object-top blur-[2px] scale-105 opacity-40" />
                                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-card to-transparent">
                                    <div>
                                        <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Question {currentQ + 1} of {quiz.questions.length}</span>
                                        <h3 className="text-white font-bold text-lg mt-0.5">{movie.title}</h3>
                                    </div>
                                    {poster && <img src={poster} alt="" className="ml-auto w-16 h-24 object-cover rounded-lg shadow-lg border border-white/10 flex-shrink-0" />}
                                </div>
                            </div>
                        )}
                        <div className="p-6 space-y-5">
                            <p className="text-white font-semibold text-lg leading-snug">{question?.text}</p>
                            <div className="grid grid-cols-2 gap-3">
                                {question?.options.map((opt) => {
                                    const isCorrect = selected !== null && opt === question.answer
                                    const isWrong = selected === opt && opt !== question.answer
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleAnswer(opt)}
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold text-left border transition-all duration-200 ${selected === null
                                                ? 'bg-white/[0.05] border-white/10 text-white hover:border-indigo-500/60 hover:bg-indigo-500/10'
                                                : isCorrect
                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                    : isWrong
                                                        ? 'bg-red-500/20 border-red-500 text-red-300'
                                                        : 'bg-white/[0.03] border-white/5 text-slate-500'
                                                }`}
                                        >
                                            {isCorrect && '✓ '}{isWrong && '✗ '}{opt}
                                        </button>
                                    )
                                })}
                            </div>
                            {selected !== null && (
                                <button
                                    onClick={nextQuestion}
                                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
                                >
                                    {currentQ < quiz.questions.length - 1 ? 'Next Question →' : 'See Results'}
                                </button>
                            )}
                        </div>
                    </div>
                ) : finished ? (
                    <div className="bg-card border border-white/10 rounded-2xl p-8 text-center space-y-4">
                        <div className="text-6xl">{score === quiz.questions.length ? '🏆' : score >= quiz.questions.length / 2 ? '🎉' : '😅'}</div>
                        <h3 className="text-2xl font-bold text-white">
                            {score}/{quiz.questions.length} Correct
                        </h3>
                        <p className="text-slate-400">
                            {score === quiz.questions.length ? "Perfect score!" : score >= quiz.questions.length / 2 ? "Not bad!" : "Keep watching more movies!"}
                        </p>
                        <div className="flex gap-3 justify-center pt-2">
                            <button onClick={nextMovie} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors">Next Movie</button>
                            <button onClick={reset} className="px-6 py-2.5 bg-white/[0.07] hover:bg-white/10 text-white font-semibold rounded-xl transition-colors border border-white/10">Reset</button>
                        </div>
                    </div>
                ) : null}

                {!buildingQuiz && !finished && pool.length > 1 && (
                    <button onClick={nextMovie} className="mt-4 text-sm text-slate-400 hover:text-slate-200 transition-colors w-full text-center">
                        Skip this movie →
                    </button>
                )}
            </div>
            <Footer />
        </div>
    )
}
