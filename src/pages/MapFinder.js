// import components
import StaticHeader from './StaticHeader';
import { FooterContainer } from '../homepage/components/Footer'
import MapPage from '../map/MapPage'
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
    <div className='overflow-hidden flex flex-col min-h-screen'>
      <StaticHeader />
      <div className='flex-grow'></div>
      <MapPage />
      <FooterContainer />
    </div>
  );
}

export default Home;