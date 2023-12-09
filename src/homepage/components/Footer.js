import React from 'react';
// import data
import {footer} from '../data'
// import components
import Copyright from '../components/Copyright'

const Footer = () => {
  // destructure footer data
  const {logo, links, legal, newsletter, form} = footer
  return (
  <footer className='pt-[142px] pb-[60px]'>
    <div className='container mx-auto'>
      <div className='flex flex-col items-center text-center
      lg:flex-row lg:items-start lg:text-left
      lg:justify gap-y-8'>
        <div data-aos='fade-up' data-aos-offset='200'
          data-aos-delay='300'>
          <img src={logo} alt='' />
        </div>
        <div data-aos='fade-up' data-aos-offset='200'
          data-aos-delay='500'>
          <div className='text-2x1 uppercase font-medium
          mb-6'>Links</div>
          <ul className='flex flex-col gap-y-3'>
            {links.map((item, index) => {
              const {href, name} = item
              return(
                <li key={index}>
                  <a className='font-medium hover:text-accent transition'
                  href={href}>
                    {name}</a>
                </li>
              )
            })}
          </ul>
          </div>
        <div data-aos='fade-up' data-aos-offset='200'
        data-aos-delay='700'
        className='text-2x1 uppercase font-medium mb-6'
        >Legal</div>
          <ul className='flex flex-col gap-y-3'>
            {links.map((item, index) => {
              const {href, name} = item
              return(
                <li key={index}>
                  <a className='font-medium hover:text-accent transition'
                  href={href}>
                    {name}</a>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <div className='text-2x1 uppercase font-medium mb-6'
          >{newsletter.title}</div>
          <div className='text-x1 text-light mb-[118px]'>
            {newsletter.subtitle}</div>
          <form className='max-w-[349px]
          mb-[10px]'>
            <div className='h-[62px] p-[7px] flex border
            border-dark rounded-1g'>
              <input
                className='w-full h-full pl-6 border-none
                outline-none placeholder:text-dark'
                type="text"
                placeholder={
                form.placeholder}
              />
              <button className='btn btn-sm
                bg-accent hover:bg-accentHover w-[102px]
                text-white'
              >{form.btnText}</button>
            </div>
          </form>
          <span className='text-sm textlight'>
            {form.smallText}
          </span>
        </div>
      </div>
    </footer>
  )
};

export default Footer;
