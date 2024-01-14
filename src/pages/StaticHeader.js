import React, {useState, useEffect} from 'react';
// import data
// import icons
import {HiMenuAlt4, HiOutlineX} from 'react-icons/hi'
//import components
import MobileNav from '../homepage/components/MobileNav'
import Nav from '../homepage/components/Nav'
import { header } from '../homepage/data';
import { Button } from "@material-ui/core";
import { Link, useLocation, useNavigate } from "react-router-dom";


const StaticHeader = () => {
  // mobile navbar state
  const [mobileNav, setMobileNav] = useState(false);
  // header state
  const [isActive, setIsActive] = useState(false)
  // destructure header data
  const {logo/*, btnText*/} = header
  // scroll event
  useEffect(() => {
    window.addEventListener('scroll', ()=> {
      window.scrollY > 60 ? setIsActive(true) : setIsActive(false);
    })
  })

  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const renderButtons = () => {
    if (!isLoggedIn) {
      return (
        <div>
          <Button
            style={{ color: 'black', backgroundColor: 'orange',
              marginRight: '10px', borderLeft: '2px solid black',
              borderBottom: '2px solid black' }}
            component={Link}
            to="/park-view"
            className='btn btn-sm btn-outline hidden lg:flex'
          >
            ParkView
          </Button>
          <Button
            style={{ color: 'black', backgroundColor: 'yellow',
              marginRight: '10px', borderLeft: '2px solid black',
              borderBottom: '2px solid black' }}
            component={Link}
            to="/account"
            className='btn btn-sm btn-outline hidden lg:flex'
          >
            My Account
          </Button>
          <Button
            style={{ color: 'black', backgroundColor: 'red',
            marginRight: '10px', borderLeft: '2px solid black',
            borderBottom: '2px solid black' }}
            onClick={handleLogout}
            className='btn btn-sm btn-outline hidden lg:flex'
          >
            Logout
          </Button>
        </div>
      );
    } else if (location.pathname !== "/login") {
      return (
        <Button
          color="inherit"
          component={Link}
          to="/login"
          className='btn btn-sm btn-outline hidden lg:flex'
          style={{ border: '2px solid black' }}
        >
          Login
        </Button>
      );
    }
  
    // If none of the conditions are met, return null or an empty fragment
    return null;
  };


  return <header className={`${isActive ? 'lg:top-0 bg-white shadow-2xl' :
    'lg:top-0'
  } bg-yellow-400 py-6 lg:py-4 fixed w-full transition-all z-10`}
  style={
    {
     border: '2px solid black'
    }
  }
  >
    <div className='container mx-auto flex justify-between items-center'>
      <a href='#'>
        <img src={logo} alt=''/>
      </a>
      <div className='hidden lg:flex'>
        <Nav isLoggedIn={isLoggedIn}/>
      </div>
      {/* Conditionally render buttons */}
      {renderButtons()}
      <button className='lg:hidden' onClick={()=>setMobileNav(!mobileNav)}>
        {mobileNav ? (
          <HiOutlineX className='text-3x1 text-accent' />
        ):(
          <HiMenuAlt4 className='text-3x1 text-accent'/>
        )}
      </button>
      {/* mobile nav - hidden on desktop */}
      <div className={`${
        mobileNav ? 'left-0' : '-left-full'
      } fixed top-0 bottom-0 w-[60vw] lg:hidden transition-all`}
      >
        <MobileNav />
      </div>
    </div>
    </header>;
};

export default StaticHeader;
