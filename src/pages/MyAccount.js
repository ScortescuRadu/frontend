// import components
import StaticHeader from './StaticHeader';
import { FooterContainer } from '../homepage/components/Footer'
import Aos from 'aos'
import 'aos/dist/aos.css'
import '../homepage/index.css';
import MyAccountPage from '../account/MyAccount'
import ParkingLotInfo from '../account/ParkingLotInfo';

const MyAccount = () => {
    // initialize aos
    Aos.init({
      duration: 1800,
      offset: 100,
    })
  return (
    <div className='overflow-hidden flex flex-col min-h-screen'>
      <StaticHeader />
      <div className='flex-grow'></div>
      <div className='mt-20'>
        <MyAccountPage />
      </div>
      <FooterContainer />
    </div>
  );
}

export default MyAccount;