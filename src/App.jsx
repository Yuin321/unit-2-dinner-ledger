import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const housemates = ['瑀石', '玮杰'];
const prices = [7, 15];

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dinners, setDinners] = useState({});
  const [attendees, setAttendees] = useState([]);
  const [priceOption, setPriceOption] = useState('7');
  const [customPrice, setCustomPrice] = useState('');

  // Real-time fetching of dinners from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "dinners"), (querySnapshot) => {
      const dinnersData = {};
      querySnapshot.forEach((doc) => {
        dinnersData[doc.id] = doc.data();
      });
      setDinners(dinnersData);  // Update state with Firestore data
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  const handleDayClick = (date) => {
    const key = date.toDateString();
    const dinner = dinners[key];
    setSelectedDate(date);

    if (dinner) {
      if (prices.includes(dinner.price)) {
        setPriceOption(dinner.price.toString());
        setCustomPrice('');
      } else {
        setPriceOption('custom');
        setCustomPrice(dinner.price.toString());
      }
    } else {
      setPriceOption('7');
      setCustomPrice('');
    }

    setAttendees(dinner?.attendees || []);
  };

  const toggleAttendee = (name) => {
    setAttendees((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const saveDinner = async () => {
    const key = selectedDate.toDateString();
    const dinnerData = {
      attendees,
      price: Number(customPrice) || Number(priceOption),
    };
    await setDoc(doc(db, "dinners", key), dinnerData);
    setSelectedDate(null);
  };

  const deleteDinner = async () => {
    const key = selectedDate.toDateString();
    await deleteDoc(doc(db, "dinners", key));
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
      <div style={{ display: 'flex', gap: '1rem' }}>
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
              <select value={priceOption} onChange={(e) => setPriceOption(e.target.value)}>
                {prices.map((p) => (
                  <option key={p} value={p}>{`$${p}`}</option>
                ))}
                <option value="custom">Custom</option>
              </select>

              {priceOption === 'custom' && (
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
            <button onClick={deleteDinner} style={{ backgroundColor: 'red', color: 'white' }}>
              Delete Dinner
            </button>
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
