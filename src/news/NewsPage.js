import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Grid, Pagination, Skeleton, Box } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './NewsPage.css'
import { Link } from 'react-router-dom';
import Slider from "react-slick";
// import "slick-carousel/slick/slick.css"; 
// import "slick-carousel/slick/slick-theme.css";

const NewsPage = () => {
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      cssEase: "linear"
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/article/featured/?page=${currentPage}`);
          const data = await response.json();
          setArticles(data.results);
          setTotalPages(data.total);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, [currentPage]);
  
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };
  
    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
      <div style={{ color: '#fff', minHeight: '10vh' }}>
          <div style={{ height: '0px', backgroundColor: 'black' }}/>
          <Slider {...settings}>
          {articles.length > 0 ? articles.map((article, index) => (
            <Card key={article.id} style={{ width: '100%' }}>
              <Box style={{
                position: 'relative',
                height: '600px',
                width: '100%',
                backgroundImage: `url(${article.cover || 'path/to/default/image.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <Typography variant="h5" style={{
                  position: 'absolute',
                  bottom: 150,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  background: 'linear-gradient(45deg, #6a3093, #a044ff)', // Gradient from purple to bright violet
                  padding: '5px 20px',
                  borderRadius: '5px',
                  textAlign: 'center',
                  maxWidth: '80%',
                  fontWeight: 'bold',
                  fontSize: '1.5em', // Larger text size for impact
                  textShadow: '2px 2px 8px rgba(0,0,0,0.6)'
                }}>
                  {article.title}
                </Typography>
                <Typography variant="overline" style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: '#fff',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  padding: '3px 7px',
                  borderRadius: '5px',
                  fontSize: '0.75em',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}>
                  {article.category}
                </Typography>
              </Box>
            </Card>
            )) : Array.from(new Array(5)).map((_, index) => (
              <div key={index}>
                <Skeleton variant="rectangular" width="100%" height={500}>
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={50}
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                    }}
                  />
                  <Skeleton
                    variant="text"
                    width="70%"
                    height={60}
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      left: '15%',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                    }}
                  />
                </Skeleton>
              </div>
            ))}
          </Slider>
          <div style={{ height: '120px',
                        backgroundColor: '#000',
                        borderBottomLeftRadius: '30px',
                        borderBottomRightRadius: '30px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                  padding: '8px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: 'none',
                  width: '50%',
                  color: 'black'
              }}
            />
          </div>
          <Masonry
              columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
              defaultHeight={450}
              defaultColumns={4}
              defaultSpacing={1}
              spacing={{ xs: 1, sm: 2, md: 3, lg: 4 }}
          >
            {articles.map((article) => (
              <Grid item key={article.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  style={{
                    width: '99%',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 'auto',
                    border: '2px solid black',
                    borderRadius: '10px',
                  }}
                  variant='outlined'
                  className='card-class'
                >
                  <CardMedia
                    component="img"
                    alt={article.title}
                    height="200"
                    image={article.cover}
                    style={{
                      width: '90%',
                      height: '50%',
                      margin: 'auto',
                      justifyContent: 'center',
                      borderBottomLeftRadius: '10px',
                      borderBottomRightRadius: '10px',
                      objectFit: 'cover',
                      maxHeight: '180px'
                    }}
                  />
                  <CardContent
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: '16px',
                      order: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center', // Center the content vertically
                      alignItems: 'center', // Center the content horizontally
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{
                        backgroundColor: 'yellow',
                        paddingLeft: '18px',
                        paddingRight: '18px',
                        fontWeight: 'bold',
                        fontSize: '1.2em',  // Adjust the value for the desired font size
                      }}
                    >
                      {article.title}
                    </Typography>
                    <div style={{ height: '25px' }} />
                    <Typography variant="body1"
                      color="ActiveBorder">
                        {article.description}
                    </Typography>
                    <div style={{ height: '30px' }}/> {/* Empty div for spacing */}
                    <Link to={`/news/article?id=${article.id}`}>
                        <Button
                          variant="contained"
                          color="primary"
                          style={{
                            border: '2px solid black',
                            borderRadius: '8px',
                          }}
                        >
                            Read More
                        </Button>
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          {/* </Grid> */}
          </Masonry>
          <div style={{ textAlign: 'center', marginTop: '20px'}}>
            <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    hidePrevButton={currentPage === 1}
                    hideNextButton={currentPage === totalPages}
                    color='secondary'
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '20px',
                    }}
            />
          </div>
          <div style={{ height: '20px' }}/>
        </div>
      );
};

export default NewsPage;
