import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Grid } from '@mui/material';
import Slider from 'react-slick';
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
        <div>
            <div style={{ height: '40px' }}/> {/* Empty div for spacing */}
          <Grid container spacing={3} justifyContent="center">
            {articles.map((article) => (
              <Grid item key={article.id} xs={12} sm={6} md={6} lg={6}>
                <Card
                  style={{
                    width: '95%',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 'auto',
                  }}
                >
                  <CardMedia
                    component="img"
                    alt={article.title}
                    height="200"
                    image={article.cover}
                    style={{
                      width: '100%',
                      order: -1,
                      height: '40%',
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
                    <Typography variant="h6">{article.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {article.description}
                    </Typography>
                    <div style={{ height: '20px' }}/> {/* Empty div for spacing */}
                    <Link to={`/news/article?id=${article.id}`}>
                        <Button variant="contained" color="primary">
                            Read More
                        </Button>
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {currentPage > 1 && (
              <Button onClick={handlePreviousPage}>
                Previous Page
              </Button>
            )}
            <span>{`Page ${currentPage}`}</span>
            {currentPage < totalPages && (
              <Button onClick={handleNextPage}>
                Next Page
              </Button>
            )}
          </div>
        </div>
      );
};

export default NewsPage;
