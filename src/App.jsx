import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

const housemates = ['瑀石', '玮杰'];
const prices = [7, 15];

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dinners, setDinners] = useState(() => {
    const saved = localStorage.getItem('unit2dinners');
    return saved ? JSON.parse(saved) : {};
  });

  const [attendees, setAttendees] = useState([]);
  const [price, setPrice] = useState(7);
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    localStorage.setItem('unit2dinners', JSON.stringify(dinners));
  }, [dinners]);

  const handleDayClick = (date) => {
    const key = date.toDateString();
    const dinner = dinners[key];
    setSelectedDate(date);
    setPrice(dinner?.price || 7);
    setCustomPrice('');
    setAttendees(dinner?.attendees || []);
  };

  const toggleAttendee = (name) => {
    setAttendees((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const saveDinner = () => {
    const key = selectedDate.toDateString();
    setDinners((prev) => ({
      ...prev,
      [key]: { attendees, price: customPrice || price },
    }));
    setSelectedDate(null);
  };

  const calculateTotals = () => {
    const totals = {};
    housemates.forEach((mate) => (totals[mate] = 0));

    Object.values(dinners).forEach(({ attendees, price }) => {
      attendees.forEach((name) => {
        totals[name] += price;
      });
    });

    return totals;
  };

  const totals = calculateTotals();

  const isDinnerDay = (date) => {
    return !!dinners[date.toDateString()];
  };

  return (
    <div className="App">
      <h1>Unit 2 Dinner 🍽️</h1>
      <div style={{display: 'flex', gap: '1rem'}}>
        <Calendar
          onClickDay={handleDayClick}
          tileClassName={({ date }) =>
            isDinnerDay(date) ? 'dinner-day' : null
          }
        />

        {selectedDate && (
          <div className="modal">
            <h2>Dinner on {selectedDate.toDateString()}</h2>
            <label>
              Price per person:
              <select value={price} onChange={(e) => setPrice(Number(e.target.value))}>
                {prices.map((p) => (
                  <option key={p} value={p}>${p}</option>
                ))}
                <option value="custom">Custom</option>
              </select>
              {price === 'custom' && (
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Enter custom price"
                />
              )}
            </label>
            <div>
              {housemates.map((name) => (
                <label key={name}>
                  <input
                    type="checkbox"
                    checked={attendees.includes(name)}
                    onChange={() => toggleAttendee(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
            <button onClick={saveDinner}>Save Dinner</button>
            <button onClick={() => setSelectedDate(null)}>Cancel</button>
          </div>
        )}
      </div>

      <h2>Monthly Summary 💰</h2>
      <ul>
        {housemates.map((name) => (
          <li key={name}>
            {name}: ${totals[name]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
