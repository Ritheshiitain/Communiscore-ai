import React, { useState, useEffect } from 'react';

const DEFAULT_API_KEY = 'AIzaSyDKtzASlVNczLVeq7zLwo2aPxzhNZ2lyx4';

export default function SettingsView() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [targetEyeContact, setTargetEyeContact] = useState(70);
  const [targetPosture, setTargetPosture] = useState(80);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile details
  const [profileName, setProfileName] = useState('Hackathon Presenter');
  const [profileRole, setProfileRole] = useState('Public Speaker');
  const [profileTeam, setProfileTeam] = useState('BehaviorIQ Dev Team');

  useEffect(() => {
    // Load existing settings
    let savedKey = localStorage.getItem('gemini_api_key');
    if (!savedKey) {
      // Pre-fill with the provided hackathon API key out of the box
      localStorage.setItem('gemini_api_key', DEFAULT_API_KEY);
      savedKey = DEFAULT_API_KEY;
    }
    setApiKey(savedKey);
    
    const savedEye = localStorage.getItem('target_eye_contact');
    if (savedEye) setTargetEyeContact(Number(savedEye));
    
    const savedPosture = localStorage.getItem('target_posture');
    if (savedPosture) setTargetPosture(Number(savedPosture));

    // Profile details loading
    const savedName = localStorage.getItem('profile_name');
    if (savedName) setProfileName(savedName);
    
    const savedRole = localStorage.getItem('profile_role');
    if (savedRole) setProfileRole(savedRole);

    const savedTeam = localStorage.getItem('profile_team');
    if (savedTeam) setProfileTeam(savedTeam);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('target_eye_contact', String(targetEyeContact));
    localStorage.setItem('target_posture', String(targetPosture));
    localStorage.setItem('profile_name', profileName);
    localStorage.setItem('profile_role', profileRole);
    localStorage.setItem('profile_team', profileTeam);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all saved settings?')) {
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('target_eye_contact');
      localStorage.removeItem('target_posture');
      localStorage.removeItem('profile_name');
      localStorage.removeItem('profile_role');
      localStorage.removeItem('profile_team');
      setApiKey('');
      setTargetEyeContact(70);
      setTargetPosture(80);
      setProfileName('Hackathon Presenter');
      setProfileRole('Public Speaker');
      setProfileTeam('BehaviorIQ Dev Team');
    }
  };

  return (
    <div className="settings-view" style={{ 
      maxWidth: '900px', 
      margin: '20px auto 0', 
      display: 'grid', 
      gridTemplateColumns: '320px 1fr', 
      gap: '24px' 
    }}>
      
      {/* ── User Profile Panel ── */}
      <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
        <p className="panel-title" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>
          USER PROFILE
        </p>

        {/* Circular Avatar */}
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--indigo), var(--teal))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          boxShadow: 'var(--shadow-glow-indigo)',
          margin: '10px 0'
        }}>
          {profileName.charAt(0).toUpperCase()}
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{profileName}</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {profileRole}
          </p>
        </div>

        <div style={{ 
          width: '100%', 
          borderTop: '1px solid var(--border)', 
          paddingTop: '16px',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>HACKATHON TEAM</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{profileTeam}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>STATUS</span>
            <span style={{ color: 'var(--green)', fontWeight: '600' }}>● ACTIVE PRESENTATION MODE</span>
          </div>
        </div>
      </div>

      {/* ── Configuration Panel ── */}
      <div className="panel" style={{ padding: '24px' }}>
        <p className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Profile & Platform Settings</p>
        <p className="panel-desc" style={{ marginBottom: '24px' }}>
          Customize your speaker profile details and API keys. The default Google Gemini API key has been pre-configured for your convenience.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Profile Editing Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Speaker Name</label>
              <input 
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                style={{
                  background: '#020617',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Role / Designation</label>
              <input 
                type="text"
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                style={{
                  background: '#020617',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Hackathon Team Name</label>
              <input 
                type="text"
                value={profileTeam}
                onChange={(e) => setProfileTeam(e.target.value)}
                style={{
                  background: '#020617',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Gemini API Key */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Google Gemini API Key
            </label>
            <div style={{ position: 'relative', display: 'flex' }}>
              <input 
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  background: '#020617',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '10px 48px 10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Using default Hackathon key.
            </span>
          </div>

          {/* Performance Targets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Target Eye Contact %
              </label>
              <input 
                type="number"
                min="10"
                max="100"
                value={targetEyeContact}
                onChange={(e) => setTargetEyeContact(Number(e.target.value))}
                style={{
                  background: '#020617',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Target Posture Index
              </label>
              <input 
                type="number"
                min="10"
                max="100"
                value={targetPosture}
                onChange={(e) => setTargetPosture(Number(e.target.value))}
                style={{
                  background: '#020617',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
            <button 
              type="submit" 
              className="toggle-btn"
              style={{ 
                padding: '10px 24px', 
                fontSize: '13px', 
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--indigo), #4338ca)',
                borderColor: 'var(--border-bright)'
              }}
            >
              💾 Save Settings
            </button>

            <button 
              type="button" 
              className="toggle-btn paused"
              style={{ padding: '10px 24px', fontSize: '13px' }}
              onClick={handleClear}
            >
              🗑 Reset All
            </button>
          </div>

          {saveSuccess && (
            <div className="alert info" style={{ padding: '10px 14px', fontSize: '13px' }}>
              ✔ Profile settings successfully updated!
            </div>
          )}

        </form>
      </div>

    </div>
  );
}
