import { useState, useEffect } from 'react';

export default function usePincode(pincode) {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pinStr = String(pincode || '').trim();
    
    if (pinStr.length !== 6 || !/^\d{6}$/.test(pinStr)) {
      setCity('');
      setState('');
      setError(null);
      return;
    }

    const fetchLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pinStr}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          setCity(po.District || '');
          setState(po.State || '');
        } else {
          setCity('');
          setState('');
          setError('Invalid pincode');
        }
      } catch (err) {
        setCity('');
        setState('');
        setError('Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchLocation();
    }, 400);

    return () => clearTimeout(timer);
  }, [pincode]);

  return { city, state, loading, error };
}
