import React, { useState, useRef } from 'react';
import { Send, Clock, Globe, Image as ImageIcon, X, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { uploadToCloudinary } from '../api/cloudinary';

export const PostComposer = ({ channels, onPost }) => {
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [imageUrl, setImageUrl] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [igType, setIgType] = useState('post');

  const isInstagramSelected = selectedChannels.some(id => 
    channels.find(c => String(c.id) === String(id))?.service === 'instagram'
  );

  const toggleChannel = (id) => {
    const stringId = String(id);
    setSelectedChannels(prev => 
      prev.includes(stringId) 
        ? prev.filter(c => c !== stringId) 
        : [...prev, stringId]
    );
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text || selectedChannels.length === 0 || loading || isUploading) return;
    
    setLoading(true);
    setError(null);
    const mode = showSchedule ? 'customScheduled' : 'addToQueue';
    const dueAt = mode === 'customScheduled' ? startDate.toISOString() : null;
    
    let apiImageUrl = imageUrl;

    // If we have a local image, upload it to Cloudinary first
    if (imageUrl?.startsWith('data:') && rawFile) {
      setIsUploading(true);
      try {
        apiImageUrl = await uploadToCloudinary(rawFile);
      } catch (err) {
        setError('Image upload failed: ' + err.message);
        setLoading(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const assets = apiImageUrl ? [{ url: apiImageUrl }] : [];

    try {
      let hasError = false;
      for (const channelId of selectedChannels) {
        const channel = channels.find(c => String(c.id) === String(channelId));
        const result = await onPost({ 
          text, 
          channelId, 
          mode, 
          dueAt,
          assets,
          type: channel?.service === 'instagram' ? igType : null
        });
        if (result?.error) {
          setError(result.message);
          hasError = true;
          break;
        }
      }
      
      if (!hasError) {
        setText('');
        setSelectedChannels([]);
        setShowSchedule(false);
        setShowChannels(false);
        setImageUrl(null);
        setRawFile(null);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB');
        return;
      }
      setRawFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const canPost = text.trim().length > 0 && selectedChannels.length > 0 && !loading && !isUploading;

  return (
    <div className="flex flex-col h-full relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Header Info */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-2xl mb-4 flex items-center gap-2 text-xs animate-fade-in">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Main Text Area */}
      <div className="flex-1 min-h-[160px] mb-6">
        <textarea
          placeholder="What are we sharing today?"
          className="w-full h-full bg-transparent text-xl font-light resize-none placeholder:text-[#222] focus:placeholder:text-[#444] transition-all no-scrollbar outline-none border-none p-0"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Media Preview */}
      {imageUrl && (
        <div className="relative w-40 h-40 mb-10 rounded-[2rem] overflow-hidden border border-border bg-[#050505] group animate-fade-in shadow-2xl">
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100" />
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10 pointer-events-none z-10">
            {isUploading ? 'Uploading...' : 'Local Preview'}
          </div>
          <button 
            onClick={() => { setImageUrl(null); setRawFile(null); }}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-white hover:text-black z-20"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Collapsible Panels */}
      <div className="space-y-4 mb-8">
        {isInstagramSelected && (
          <div className="bg-[#050505] border border-border rounded-[2rem] p-6 animate-fade-in shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-5 px-1">Instagram Format</p>
            <div className="flex gap-3">
              {['post', 'story', 'reel'].map(type => (
                <button
                  key={type}
                  onClick={() => setIgType(type)}
                  className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                    igType === type 
                      ? 'bg-white text-black border-white shadow-xl shadow-white/5' 
                      : 'bg-[#0a0a0a] text-text-muted border-border hover:border-[#333]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {showChannels && (
          <div className="bg-[#050505] border border-border rounded-[2rem] p-6 animate-fade-in shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-5 px-1">Social Accounts</p>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {channels.length > 0 ? (
                channels.map(channel => {
                  const isSelected = selectedChannels.includes(String(channel.id));
                  return (
                    <button
                      key={channel.id}
                      onClick={() => toggleChannel(channel.id)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white text-black border-white shadow-lg' 
                          : 'bg-[#0a0a0a] text-text-muted border-border hover:border-[#333]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[11px] ${isSelected ? 'bg-black text-white' : 'bg-white/5 text-text-muted'}`}>
                          {channel.service[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold tracking-tight">{channel.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={20} />}
                    </button>
                  );
                })
              ) : (
                <p className="text-text-muted text-xs italic py-4 text-center">No channels connected yet...</p>
              )}
            </div>
          </div>
        )}

        {showSchedule && (
          <div className="bg-[#050505] border border-border rounded-[2rem] p-6 animate-fade-in shadow-2xl">
            <div className="flex items-center gap-3 mb-5 px-1">
              <CalendarIcon size={14} className="text-text-muted" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Custom Schedule</span>
            </div>
            <div className="date-picker-container overflow-hidden rounded-2xl border border-border/50">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                dateFormat="Pp"
                inline
                calendarClassName="postly-calendar"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-8 border-t border-border mt-auto">
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center border ${imageUrl ? 'bg-white text-black border-white shadow-xl shadow-white/10' : 'bg-[#0a0a0a] text-text-muted hover:text-white border-border hover:border-[#333]'}`}
            title="Add Image"
          >
            <ImageIcon size={22} />
          </button>
          <button 
            onClick={() => { setShowSchedule(!showSchedule); setShowChannels(false); }}
            className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center border ${showSchedule ? 'bg-white text-black border-white shadow-xl shadow-white/10' : 'bg-[#0a0a0a] text-text-muted hover:text-white border-border hover:border-[#333]'}`}
            title="Schedule"
          >
            <Clock size={22} />
          </button>
          <button 
            onClick={() => { setShowChannels(!showChannels); setShowSchedule(false); }}
            className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center border ${showChannels ? 'bg-white text-black border-white shadow-xl shadow-white/10' : 'bg-[#0a0a0a] text-text-muted hover:text-white border-border hover:border-[#333]'}`}
            title="Select Channels"
          >
            <Globe size={22} />
          </button>
        </div>
        
        <button
          onClick={handlePost}
          disabled={!canPost}
          className={`px-12 py-5 rounded-2xl font-black text-sm flex items-center gap-4 transition-all duration-500 transform ${
            canPost 
              ? 'bg-white text-black shadow-2xl shadow-white/20 hover:scale-[1.02] active:scale-[0.98] opacity-100 cursor-pointer' 
              : 'bg-[#111] text-[#333] opacity-50 cursor-not-allowed'
          }`}
        >
          {isUploading ? 'UPLOADING...' : loading ? 'POSTING...' : showSchedule ? 'SCHEDULE' : 'POST NOW'}
          {!loading && !isUploading && <Send size={20} className={canPost ? 'animate-pulse' : ''} />}
        </button>
      </div>
    </div>
  );
};
