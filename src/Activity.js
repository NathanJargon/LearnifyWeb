import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { firebase } from './FirebaseConfig';
import 'firebase/firestore';
import './Activity.css'; 
import logo from './images/logo.png'; 
import profile from './images/profile.png';
import cardBackground from './images/html.png';
import bell from './images/bell.png'; 
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

function Activity() {
  const navigate = useNavigate();
  const { courseId, activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [selectedChoices, setSelectedChoices] = useState({});
  const allQuestionsAnswered = activity && activity.questions.every((_, index) => selectedChoices[index] !== undefined);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  
  const handleQuit = () => {
    navigate(`/usercourse/${courseId}`); // navigate to the dashboard page or any other page you want
  };

  
  const handleChoiceSelect = (questionIndex, choiceIndex) => {
    setSelectedChoices(prevChoices => ({
      ...prevChoices,
      [questionIndex]: choiceIndex
    }));
  };

  const handleSubmit = async () => {
    // Calculate the score
    const score = activity.questions.reduce((totalScore, question, index) => {
      if (Number(selectedChoices[index]) === Number(question.correctAnswer)) {
        return totalScore + 1;
      } else {
        return totalScore;
      }
    }, 0);
  
    // Get the currently logged-in user
    const user = firebase.auth().currentUser;
  
    // Get the Firestore document
    const db = firebase.firestore();
    const doc = await db.collection('activities').doc(activityId).get();
    const activityData = doc.data();
  
    // Initialize ActivityResult if it doesn't exist
    if (!activityData.ActivityResult) {
      activityData.ActivityResult = [];
    }
  
    // Check if a result for the current user already exists
    const existingResultIndex = activityData.ActivityResult.findIndex(result => result.userEmail === user.email);
  

    if (existingResultIndex !== -1) {
        // If a result for the current user already exists, replace it with the new result
        activityData.ActivityResult[existingResultIndex] = {
        userEmail: user.email,
        userId: user.uid,
        score: score,
        courseId: courseId,
        activityId: activityId,
        };
    } else {
        // If no result for the current user exists, add the new result
        activityData.ActivityResult.push({
        userEmail: user.email,
        userId: user.uid,
        score: score,
        courseId: courseId,
        activityId: activityId,
        });
    }

    // Update the Firestore document
    await db.collection('activities').doc(activityId).update({
        ActivityResult: activityData.ActivityResult
    });

    console.log('Activity result has been saved.');

    alert(`Your score is ${score}`);
    };

  useEffect(() => {
    const fetchActivity = async () => {
      const db = firebase.firestore();
      const doc = await db.collection('activities').doc(activityId).get();

      console.log('id:', activityId);
      console.log('doc:', doc.data());

      const user = firebase.auth().currentUser;

      if (user) {
        console.log('User is logged in:', user);
      } else {
        console.log('No user is logged in.');
      }

      if (doc.exists) {
        const activityData = doc.data();
        activityData.questions = activityData.questions.map(question => ({
          ...question,
          correctAnswer: Number(question.correctAnswer)
        }));
        setActivity(activityData);
      } else {
        console.log('No such document!');
      }
    };

    fetchActivity();
  }, [activityId]);

  const handleLogout = async () => {
    await firebase.auth().signOut();
    navigate('/dashboard'); // navigate to the dashboard page
  };


  return (
    <div className="content-container">
      <div className="header-box">
        <div className="logo-title" onClick={() => navigate('/home')}>
          <img src={logo} alt="Logo" className="logo" />
          <h1>Learnify</h1>
        </div>
        <div className="search-profile">
          <div className="search-box">
            <input type="text" placeholder="Search Courses" />
            <FaSearch />
          </div>
          <img src={profile} alt="Profile" className="profile-icon" onClick={() => setDropdownVisible(!isDropdownVisible)} />

          {isDropdownVisible && (
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Log out</button>
            </div>
          )}


        </div>
      </div>

      {activity && (
        <div className="activity-content">
          <h2 className="activity-title">Activity: {activity.activityName}</h2>
          {activity.questions.map((question, questionIndex) => (
            <div className="question-card" key={questionIndex}>
              <p><strong>Question {questionIndex + 1}:</strong> {question.question}</p>
              {question.choices.map((choice, choiceIndex) => (
                <div className="choice-card" key={choiceIndex}>
                  <p><strong>Choice {choiceIndex + 1}:</strong> {choice}</p>
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    onChange={() => handleChoiceSelect(questionIndex, choiceIndex)}
                  />
                </div>
              ))}
            </div>
          ))}
          <div className="button-container">
            <button className="quit-button" onClick={handleQuit}>Quit</button>
            <button className="submit-button" onClick={handleSubmit} disabled={!allQuestionsAnswered}>Submit</button>
          </div>
      </div>
    )}


    </div>
  );
}

export default Activity;