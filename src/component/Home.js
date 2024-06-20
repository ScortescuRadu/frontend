// import components
import Header from '../homepage/components/Header';
import Hero from '../homepage/components/Hero';
import Overview from '../homepage/components/Overview';
import Feature1 from '../homepage/components/Feature1'
import Feature2 from '../homepage/components/Feature2'
import Feature3 from '../homepage/components/Feature3'
import Product from '../homepage/components/Product'
import Testimonials from '../homepage/components/Testimonials'
import Cta from '../homepage/components/Cta'
import { FooterContainer } from '../homepage/components/Footer'
import StaticHeader from '../pages/StaticHeader';

import Aos from 'aos'
import 'aos/dist/aos.css'
import '../homepage/index.css';
import FirstPage from '../pages/FirstPage';

const Home = () => {
    // initialize aos
    Aos.init({
      duration: 1800,
      offset: 100,
    })
  return (
    <div className='overflow-hidden flex flex-col min-h-screen'>
      <StaticHeader />
      <FirstPage />
      {/* <Hero />
      <Overview />
      <Feature1 />
      <Feature2 />
      <Feature3 />
      <Product />
      <Testimonials />
      <Cta />
      <div className='flex-grow'></div> */}
      <FooterContainer />
    </div>
  );
}

export default Home;