import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const housemates = ['瑀石', '玮杰'];
const prices = [7, 15];

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dinners, setDinners] = useState({});
  const [attendees, setAttendees] = useState([]);
  const [priceOption, setPriceOption] = useState('7');
  const [customPrice, setCustomPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [details, setDetails] = useState([]);


  // Real-time fetching of dinners from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "dinners"), (snapshot) => {
      const dinnersData = {};
      snapshot.forEach((doc) => {
        dinnersData[doc.id] = doc.data();
      });
      setDinners(dinnersData);
      setLoading(false);
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);
  
  if (loading) {
    return <div>Loading...</div>; // Only while fetching data
  }

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
    const confirmed = window.confirm("Are you sure you want to delete this dinner?");
    if (!confirmed) return;
    const key = selectedDate.toDateString();
    await deleteDoc(doc(db, "dinners", key));
    setSelectedDate(null);
  };

  const calculateTotals = () => {
    const totals = {};
    housemates.forEach((mate) => (totals[mate] = 0));
  
    Object.entries(dinners).forEach(([dateStr, { attendees, price }]) => {
      const date = new Date(dateStr);
  
      // Check if dinner date matches currentMonth
      if (
        date.getFullYear() === currentMonth.getFullYear() &&
        date.getMonth() === currentMonth.getMonth()
      ) {
        attendees.forEach((name) => {
          totals[name] += price;
        });
      }
    });
  
    return totals;
  };

  const totals = calculateTotals();

  const isDinnerDay = (date) => {
    return !!dinners[date.toDateString()];
  };

  const showDetails = (name) => {
    const personDetails = [];
  
    Object.entries(dinners).forEach(([dateStr, { attendees, price }]) => {
      const date = new Date(dateStr);
  
      if (
        date.getFullYear() === currentMonth.getFullYear() &&
        date.getMonth() === currentMonth.getMonth() &&
        attendees.includes(name)
      ) {
        personDetails.push({ date: dateStr, price });
      }
    });
  
    setSelectedPerson(name);
    setDetails(personDetails);
  };
  
  return (
    <div className="App">
      <h1>Unit 2 Dinner 🍽️</h1>
      <div>
        <Calendar
          onClickDay={handleDayClick}
          onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
          tileClassName={({ date }) => {
            const hasDinner = isDinnerDay(date);
            console.log(date.toDateString(), hasDinner ? "YES" : "NO");
            return hasDinner ? 'dinner-day' : null;
          }}
        />

        {selectedDate && (
          <div className="modal-overlay">
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
          </div>
        )}
      </div>

      <h2>Monthly Summary 💰</h2>
      <ul>
        {housemates.map((name) => (
          <li key={name} onClick={() => showDetails(name)} style={{ cursor: "pointer", textDecoration: "none" }}>
            {name}: ${totals[name]}
          </li>
        ))}
      </ul>
      {selectedPerson && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Details for {selectedPerson}</h2>
            <ul style={{padding: 0}}>
              {details.length > 0 ? (
                details.map(({ date, price }, index) => (
                  <li key={index} style={{listStyleType: 'none', padding: 0}}>
                    {new Date(date).toLocaleDateString()} - ${price}
                  </li>
                ))
              ) : (
                <li>No records found for this month.</li>
              )}
            </ul>
            <button onClick={() => setSelectedPerson(null)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
