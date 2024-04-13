import React from 'react';

const Nav = ({ isLoggedIn }) => {
  return (
    <nav>
      <ul className='flex gap-x-10'>
        {/* Other navigation items */}
        <li>
          <a className='hover:text-accent transition a' href='/news'>
            News
          </a>
        </li>
        <li>
          <a className='hover:text-accent transition a' href='/map-finder'>
            Map Finder
          </a>
        </li>
        <li>
          <a className='hover:text-accent transition a' href='/payment'>
            Pay Parking
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
