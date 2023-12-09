import {useEffect, useState} from "react";

// import components
import Header from '../homepage/components/Header';
import Hero from '../homepage/components/Hero';
import Overview from '../homepage/components/Overview';
import Brands from '../homepage/components/Brands'
import Feature1 from '../homepage/components/Feature1'
import Feature2 from '../homepage/components/Feature2'
import Feature3 from '../homepage/components/Feature3'
import Product from '../homepage/components/Product'
import Pricing from '../homepage/components/Pricing'
import Testimonials from '../homepage/components/Testimonials'
import Cta from '../homepage/components/Cta'
import Footer from '../homepage/components/Footer'

import Aos from 'aos'
import 'aos/dist/aos.css'
import '../homepage/index.css';

const Home = () => {
    // initialize aos
    Aos.init({
      duration: 1800,
      offset: 100,
    })
  return (
    <div className='overflow-hidden'>
      <Header />
      <Hero />
      <Overview />
      <Feature1 />
      <Feature2 />
      <Feature3 />
      <Product />
      <Testimonials />
      <Cta />
      <Footer />
      <div className='h-[4000px]'></div>
    </div>
  );
}

export default Home;