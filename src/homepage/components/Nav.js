import React from 'react';

const Nav = ({ isLoggedIn }) => {
  return (
    <nav>
      <ul className='flex gap-x-10'>
        {/* Other navigation items */}
        <li>
          <a className='hover:text-accent transition a' href='/home'>
            Home
          </a>
        </li>
        <li>
          <a className='hover:text-accent transition a' href='/about'>
            About
          </a>
        </li>
        <li>
          <a className='hover:text-accent transition a' href='/contact'>
            Contact
          </a>
        </li>

        {/* Conditionally render "My Park" based on login status */}
        {isLoggedIn && (
          <li>
            <a className='hover:text-accent transition a' href='/my-park'>
              My Park
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
