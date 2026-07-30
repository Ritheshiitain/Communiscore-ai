import React from 'react';

const VIDEOS = [
  {
    id: 'iCvmsMzlF7o',
    title: 'How to Speak So That People Want to Listen',
    desc: 'Julian Treasure demonstrates the power of vocal pacing, volume control, timber, and the use of deliberate pauses.',
    duration: '9:58',
    category: 'Vocal Confidence',
    color: 'var(--amber)'
  },
  {
    id: 'Ks-_Mh1QhMc',
    title: 'Your Body Language Shapes Who You Are',
    desc: 'Amy Cuddy explains how power posing and upright posture affect testosterone and cortisol levels in the brain.',
    duration: '21:02',
    category: 'Posture & Stance',
    color: 'var(--teal)'
  },
  {
    id: 'R1vskiVDwl4',
    title: '10 Ways to Have a Better Conversation',
    desc: 'Celeste Headlee outlines the fundamentals of active listening, eye contact gaze patterns, and conversational flow.',
    duration: '11:44',
    category: 'Conversation Flow',
    color: 'var(--indigo)'
  },
  {
    id: 'fPpHZ72QZis',
    title: 'Reading Body Language & Facial Gestures',
    desc: 'Masterclass on interpreting facial expressions, head tilting angles, and physical positioning in public scenarios.',
    duration: '6:30',
    category: 'Facial Expressions',
    color: 'var(--green)'
  }
];

export default function TeachingVideos() {
  return (
    <div className="teaching-videos" style={{ marginTop: '20px' }}>
      
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Curated Communication Masterclasses</p>
        <p className="panel-desc">
          Professional communication resources to help you interpret your CommuniScore-AI metrics and improve your public speaking stance, gaze, and voice confidence.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', 
        gap: '24px' 
      }}>
        {VIDEOS.map((video) => (
          <div key={video.id} className="panel" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            padding: 0,
            border: '1px solid var(--border)'
          }}>
            {/* YouTube Responsive Embed */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                title={video.title}
                src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>

            {/* Video description */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  fontFamily: 'var(--font-mono)', 
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: video.color,
                  background: `${video.color}18`,
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {video.category}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⏱ {video.duration}</span>
              </div>
              
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
                {video.title}
              </h3>
              
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
                {video.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
