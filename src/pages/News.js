// import components
import StaticHeader from './StaticHeader';
import { FooterContainer } from '../homepage/components/Footer'
import NewsPage from '../news/NewsPage'
import '../homepage/index.css';

const News = () => {
  return (
    <div className='overflow-hidden flex flex-col min-h-screen'>
      <StaticHeader />
      <div className='mt-20'>
        <NewsPage/>
      </div>
      <FooterContainer />
    </div>
  );
}

export default News;