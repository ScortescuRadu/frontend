// import components
import 'aos/dist/aos.css'
import '../homepage/index.css';
import LoginPage from '../login/LoginPage';
import StaticHeader from './StaticHeader';
import { FooterContainer } from '../homepage/components/Footer'

// Color:
// #0F9A12

const Login = () => {
  return (
    <div className='overflow-hidden flex flex-col min-h-screen'>
    <StaticHeader />
    <div className='flex-grow'></div>
    <div className='mt-18'>
      <LoginPage/>
    </div>
    <FooterContainer />
  </div>
        
  );
}

export default Login;