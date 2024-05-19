import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { firebase } from './FirebaseConfig';
import 'firebase/firestore';
import './Course.css'; 
import logo from './images/logo.png'; 
import profile from './images/profile.png';
import cardBackground from './images/html.png';
import bell from './images/bell.png'; 
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

function CourseContent() {
  const navigate = useNavigate();
  const { courseId } = useParams(); // get the course id from the URL
  const [course, setCourse] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const db = firebase.firestore(); // define db here

    const fetchCourse = async () => {
      console.log('Fetching course with id:', courseId);
        
      const doc = await db.collection('courses').doc(courseId).get();
        
      if (doc.exists) {
        const courseData = doc.data();
        setCourse(courseData); // set the course state
        setComments(courseData.comments || []); // set the comments state
      } else {
        console.error('No course found with this id!');
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const commentText = event.target.elements[0].value;
    const db = firebase.firestore();

    const newComment = {
      text: commentText,
      date: new Date(),
    };

    setComments((prevComments) => [...prevComments, newComment]);

    await db.collection('courses').doc(courseId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(newComment),
    });

    event.target.reset();
  };

  return (
    <div className="content-container">
      <div className="header-box">
          <div className="logo-title" onClick={() => navigate('/instructor')}>
            <img src={logo} alt="Logo" className="logo" />
            <h1>Learnify</h1>
          </div>
        <div className="search-profile">
          <div className="search-box">
            <input type="text" placeholder="Search Courses" />
            <FaSearch />
          </div>
          <img src={bell} alt="Notifications" className="bell-icon" />
        </div>
      </div>

      <div className="content-profile-info">
        <img src={profile} alt="Profile" className="content-profile-icon" />
        <span>{course ? course.userEmail : 'Loading...'}</span>
      </div>
      <div className="content-info">
        <h2 className="course-title">{course ? course.courseName : 'Loading...'}</h2>
        <p className="course-description">{course ? course.courseDescription : 'Loading...'}</p>
      </div>

      <div className="content-objectives">
        <h3>Course Objectives</h3>
        <p>{course ? course.courseObjectives : 'Loading...'}</p>
      </div>

      <div className="content-topics">
        <h3>Course Topics</h3>
        <p>{course ? course.courseTopics : 'Loading...'}</p>
      </div>
        
      {course && course.learningMaterials && course.learningMaterials.length > 0 && (
        <div className="content-learningtitle">
          <h3>Learning Materials</h3>
          <div className="content-learningcontainer">
            <div className="content-course-grid">
              {course.learningMaterials.map((material, index) => (
                <div className="content-course-card" key={index}>
                  <a href={material} download>
                    <div className="content-card" style={{ backgroundImage: `url(${material})` }}>
                      <div className="content-card-body">
                        <img src={cardBackground} alt="HTML Logo" /> 
                        <h5 className="content-card-title">{`Learning Material ${index + 1}`}</h5>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        
      <div className="content-activitytitle">
        <h3>Activities <span className="add-activity" onClick={() => navigate(`/createactivity/${courseId}`)}>Add Activity</span></h3>
        <div className="content-activitycontainer">
        <div className="content-course-grid">
          {activities.map((activity, index) => (
            <div className="content-course-card" key={index}>
              <div className="content-card" style={{ backgroundImage: `url(${activity.image})` }}>
                <div className="content-card-body">
                  <img src={cardBackground} alt="Activity Logo" /> 
                  <h5 className="content-card-title">{`Activity ${index + 1}`}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      <div className="content-forumtitle">
        <h3>Forum</h3>
        <div className="content-forumcontainer">
        <form className="content-forumform" onSubmit={handleCommentSubmit}>
          <textarea placeholder="Write a comment..." required />
          <button type="submit">Post Comment</button>
        </form>
          <div className="content-forumcomments">
            {comments.slice().reverse().map((comment, index) => (
              <div className="content-comment" key={index}>
                <p>{comment.text}</p>
                <p>{comment.date.toDate().toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default CourseContent;