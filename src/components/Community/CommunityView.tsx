import React, { useState } from 'react';
import { CommunityPost, LeaderboardUser, Station } from '../../types/ev';
import { 
  MessageSquare, 
  ThumbsUp, 
  Trophy, 
  Zap, 
  ShieldCheck, 
  Send, 
  Flame, 
  Sparkles, 
  Gauge, 
  MapPin, 
  Award,
  Filter,
  CheckCircle2,
  Star
} from 'lucide-react';

interface CommunityViewProps {
  posts: CommunityPost[];
  leaderboard: LeaderboardUser[];
  stations: Station[];
  onAddPost: (post: CommunityPost) => void;
  onUpvotePost: (postId: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  leaderboard,
  stations,
  onAddPost,
  onUpvotePost,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  
  // New Post State
  const [commentText, setCommentText] = useState('');
  const [selectedStationId, setSelectedStationId] = useState(stations[0]?.id || '');
  const [speedTestKw, setSpeedTestKw] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(5);

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: 'Alex (You)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      authorBadge: 'Eco Trailblazer',
      stationId: selectedStation.id,
      stationName: selectedStation.name,
      city: selectedStation.city,
      rating: userRating,
      speedReportKw: speedTestKw ? Number(speedTestKw) : undefined,
      advertisedSpeedKw: selectedStation.powerMaxKw,
      comment: commentText.trim(),
      upvotes: 1,
      userUpvoted: true,
      timestamp: 'Just now',
      verifiedCharge: true,
      tags: ['Verified Check-in', speedTestKw ? 'Speed Tested' : 'Driver Tip'],
    };

    onAddPost(newPost);
    setCommentText('');
    setSpeedTestKw('');
  };

  const filteredPosts = selectedTag === 'All' 
    ? posts 
    : posts.filter((p) => p.tags.includes(selectedTag));

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            Live Crowd-Sourced EV Network
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Driver Community & Speed Verifications
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Real feedback from EV drivers on actual charging speeds, broken plugs, wait times, and nearby lounge perks.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Tags */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Speed Verified', 'Clean Restrooms', 'Hardware Repaired', 'Solar Canopy'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                    selectedTag === t
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Post Feed Cards */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-3"
                >
                  {/* Author & Station Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 ring-2 ring-emerald-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white">{post.authorName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-semibold border border-cyan-800/40">
                            {post.authorBadge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="font-medium text-slate-200">{post.stationName}</span>
                          <span>• {post.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {post.verifiedCharge && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Plug
                      </span>
                    )}
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {post.comment}
                  </p>

                  {/* Speed Test Banner if Present */}
                  {post.speedReportKw && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300 font-medium">Actual Speed Tested:</span>
                        <strong className="text-cyan-300 font-mono text-sm">{post.speedReportKw} kW</strong>
                      </div>
                      <span className="text-slate-500 text-[11px] font-mono">
                        Advertised {post.advertisedSpeedKw} kW ({Math.round((post.speedReportKw / (post.advertisedSpeedKw || 1)) * 100)}%)
                      </span>
                    </div>
                  )}

                  {/* Tags and Upvotes */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onUpvotePost(post.id)}
                      aria-label={`Upvote report by ${post.authorName}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        post.userUpvoted
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${post.userUpvoted ? 'fill-current' : ''}`} />
                      <span>{post.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Submit Check-in & Speed Report */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Submit Check-in & Speed Report</h3>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Station Visited</label>
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Actual Peak Power Delivered (kW)
                  </label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <input
                      type="number"
                      placeholder="e.g. 248"
                      value={speedTestKw}
                      onChange={(e) => setSpeedTestKw(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className={`p-1 rounded-lg text-xs font-bold transition-all ${
                          userRating >= star ? 'text-amber-400' : 'text-slate-600'
                        }`}
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star className={`w-4 h-4 ${userRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Driver Tip or Condition</label>
                  <textarea
                    rows={3}
                    placeholder="Share info on stall handle conditions, lines, clean restrooms, or cafe discounts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Community Report (+50 pts)</span>
                </button>
              </form>
            </div>

            {/* Quick Community Guidelines */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 block">EV Etiquette Tips:</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Unplug promptly once at 80% to free up fast stalls for others.</li>
                <li>Hang cables securely so plugs don't get damaged in the dirt.</li>
                <li>Report broken handles quickly to alert other community drivers.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Leaderboard View */
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Community Green EV Driver Leaderboard
              </h3>
              <p className="text-xs text-slate-400">Earn points with every verified kilowatt charged and community station tip shared.</p>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  user.name.includes('You')
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-mono text-sm ${
                    user.rank === 1 ? 'bg-amber-400 text-slate-950' :
                    user.rank === 2 ? 'bg-slate-300 text-slate-950' :
                    user.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    #{user.rank}
                  </div>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />

                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{user.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                        {user.badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {user.stationsVisited} stations discovered
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center sm:text-right shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Energy</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">{user.kwhCharged} kWh</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">CO2 Saved</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{user.co2SavedKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Points</span>
                    <span className="text-xs font-extrabold text-amber-400 font-mono">{user.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
