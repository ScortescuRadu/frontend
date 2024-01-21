import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Grid, Pagination } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './NewsPage.css'
import { Link } from 'react-router-dom'; // Import Link from React Router

const NewsPage = () => {
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
  
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
      <div style={{ backgroundColor: '#84a18d', color: '#fff', minHeight: '10vh' }}>
          <div style={{ height: '19px' }}/>
          <Grid container spacing={2} justifyContent="flex-start">
            <Grid item xs={12} lg={6} style={{ backgroundColor: '#faf75c', border: '2px solid black'}}>
              <div style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
                <h2>Title</h2>
                <Button variant="outlined" color="success">
                  Click Me
                </Button>
              </div>
            </Grid>
            <Grid item xs={12}lg={6} style={{ backgroundColor: '#a8edc6', border: '2px solid black'}}>
              <div style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
                <h2>Title</h2>
                <Button variant="outlined" color="success">
                  Click Me
                </Button>
              </div>
            </Grid>
          </Grid>
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
          <div style={{ height: '40px' }}/> {/* Empty div for spacing */}
          <Grid container spacing={4} justifyContent="flex-start">
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
          </Grid>
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
