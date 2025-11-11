import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Clock, Target, Award } from 'lucide-react';

// Sample game data
const SAMPLE_GAME = {
  id: '1',
  gameId: '401234567',
  homeTeamName: 'Duke Blue Devils',
  awayTeamName: 'North Carolina Tar Heels',
  homeScore: 84,
  awayScore: 79,
  gameStatus: 'final',
  league: 'mens',
  r69Event: {
    teamName: 'Duke Blue Devils',
    tTo69: 1380, // 23:00 into game
    periodAt69: 2,
    marginAt69: 7,
    scoreAt69Opponent: 62,
    r69w: true,
    playDescription: 'Kyle Filipowski makes layup (assisted by Jeremy Roach)'
  }
};

// Generate sample play-by-play data
const generateSamplePBP = () => {
  const plays = [];
  let homeScore = 0;
  let awayScore = 0;
  
  for (let i = 0; i < 180; i++) {
    const elapsed = i * 15; // Every 15 seconds
    
    // Randomly add points
    if (Math.random() > 0.5) {
      const points = Math.random() > 0.7 ? 3 : 2;
      if (Math.random() > 0.5) {
        homeScore += points;
      } else {
        awayScore += points;
      }
    }
    
    plays.push({
      elapsedSeconds: elapsed,
      homeScore,
      awayScore,
      period: elapsed < 1200 ? 1 : 2
    });
  }
  
  return plays;
};

const SAMPLE_PLAYS = generateSamplePBP();

export default function R69WGameTracker() {
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [highlightR69, setHighlightR69] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(SAMPLE_PLAYS.length - 1);

  useEffect(() => {
    if (autoplay && currentPlayIndex < SAMPLE_PLAYS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPlayIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoplay, currentPlayIndex]);

  const chartData = SAMPLE_PLAYS.slice(0, currentPlayIndex + 1).map(play => ({
    time: play.elapsedSeconds,
    Home: play.homeScore,
    Away: play.awayScore,
    timeDisplay: `${Math.floor(play.elapsedSeconds / 60)}:${(play.elapsedSeconds % 60).toString().padStart(2, '0')}`
  }));

  const r69Time = SAMPLE_GAME.r69Event.tTo69;
  const r69Play = SAMPLE_PLAYS.find(p => Math.abs(p.elapsedSeconds - r69Time) < 10);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMarginColor = (margin) => {
    if (margin > 10) return 'text-green-600';
    if (margin > 5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            🏀 R69W Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            The Race-to-69 & Win Tracker
          </p>
        </div>

        {/* Game Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-right">
              <h2 className="text-2xl font-bold text-gray-800">{SAMPLE_GAME.awayTeamName}</h2>
              <p className="text-4xl font-bold text-blue-600 mt-2">{SAMPLE_GAME.awayScore}</p>
            </div>
            
            <div className="px-8">
              <div className="text-center">
                <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                  FINAL
                </span>
              </div>
            </div>
            
            <div className="flex-1 text-left">
              <h2 className="text-2xl font-bold text-gray-800">{SAMPLE_GAME.homeTeamName}</h2>
              <p className="text-4xl font-bold text-orange-600 mt-2">{SAMPLE_GAME.homeScore}</p>
            </div>
          </div>
        </div>

        {/* R69 Event Badge */}
        {SAMPLE_GAME.r69Event && (
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 mb-6 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold">R69W Event</h3>
                  {SAMPLE_GAME.r69Event.r69w ? (
                    <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-bold">
                      ✅ WON
                    </span>
                  ) : (
                    <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold">
                      ❌ Premature 69
                    </span>
                  )}
                </div>
                <p className="text-lg opacity-90 mb-2">
                  <strong>{SAMPLE_GAME.r69Event.teamName}</strong> hit 69 first
                </p>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm opacity-80">Time to 69</span>
                    </div>
                    <p className="text-2xl font-bold">{formatTime(SAMPLE_GAME.r69Event.tTo69)}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm opacity-80">Margin at 69</span>
                    </div>
                    <p className="text-2xl font-bold">+{SAMPLE_GAME.r69Event.marginAt69}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-sm opacity-80">Period</span>
                    </div>
                    <p className="text-2xl font-bold">P{SAMPLE_GAME.r69Event.periodAt69}</p>
                  </div>
                </div>
                <p className="text-sm mt-3 opacity-75 italic">
                  "{SAMPLE_GAME.r69Event.playDescription}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scoring Worm Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Scoring Timeline</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPlayIndex(0)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => setAutoplay(!autoplay)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  autoplay ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {autoplay ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => setHighlightR69(!highlightR69)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  highlightR69 ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                69 Marker
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => formatTime(value)}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-gray-700 mb-2">
                          {payload[0].payload.timeDisplay}
                        </p>
                        <p className="text-orange-600 font-bold">
                          {SAMPLE_GAME.homeTeamName}: {payload[0].value}
                        </p>
                        <p className="text-blue-600 font-bold">
                          {SAMPLE_GAME.awayTeamName}: {payload[1].value}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Margin: {Math.abs(payload[0].value - payload[1].value)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              
              {highlightR69 && (
                <ReferenceLine 
                  x={r69Time} 
                  stroke="#FFD700" 
                  strokeWidth={3}
                  label={{ value: '69!', position: 'top', fill: '#FF6B35', fontWeight: 'bold' }}
                />
              )}
              <ReferenceLine 
                y={69} 
                stroke="#FFD700" 
                strokeDasharray="3 3"
                strokeWidth={2}
              />
              
              <Line 
                type="monotone" 
                dataKey="Home" 
                stroke="#FF6B35" 
                strokeWidth={3}
                dot={false}
                name={SAMPLE_GAME.homeTeamName}
              />
              <Line 
                type="monotone" 
                dataKey="Away" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={false}
                name={SAMPLE_GAME.awayTeamName}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center gap-4">
            <input
              type="range"
              min="0"
              max={SAMPLE_PLAYS.length - 1}
              value={currentPlayIndex}
              onChange={(e) => setCurrentPlayIndex(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-600">
              {formatTime(SAMPLE_PLAYS[currentPlayIndex].elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Momentum Meter */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Momentum After R69 Event</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">From 69 to Final</span>
                <span className="font-bold text-gray-900">
                  Final Margin: +{SAMPLE_GAME.homeScore - SAMPLE_GAME.awayScore}
                </span>
              </div>
              
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-1000"
                  style={{ width: '65%' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white drop-shadow">
                    {SAMPLE_GAME.r69Event.teamName} maintained lead
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Score at 69</p>
                <p className="text-2xl font-bold text-blue-600">69-62</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Final Score</p>
                <p className="text-2xl font-bold text-green-600">84-79</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Points After</p>
                <p className="text-2xl font-bold text-purple-600">+15/+17</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">R69W Rate</p>
            <p className="text-3xl font-bold">73.2%</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <Clock className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">Avg Time to 69</p>
            <p className="text-3xl font-bold">22:15</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <Target className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">Avg Margin</p>
            <p className="text-3xl font-bold">+6.8</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <Award className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">Nice Games</p>
            <p className="text-3xl font-bold">42</p>
          </div>
        </div>
      </div>
    </div>
  );
}
