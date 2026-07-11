import { useState, useEffect } from 'react';
import { db, TraderProfile } from '../db/database';

export function useProfile() {
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profiles = await db.traderProfile.toArray();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateProfile = async (updates: Partial<TraderProfile>) => {
    if (profile?.id) {
      await db.traderProfile.update(profile.id, updates);
      setProfile({ ...profile, ...updates });
    } else {
      const newProfile = { ...updates, createdAt: new Date().toISOString() } as TraderProfile;
      const id = await db.traderProfile.add(newProfile);
      setProfile({ ...newProfile, id });
    }
  };

  return { profile, loading, updateProfile };
}