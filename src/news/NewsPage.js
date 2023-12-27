import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Grid } from '@mui/material';

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
      <Grid container spacing={3} justifyContent="center">
        {articles.map((article) => (
          <Grid item key={article.id} xs={12} sm={6} md={6} lg={6}>
            <Card
              sx={{
                width: { xs: '95%', sm: '95%', md: '95%', lg: '90%' },
                display: 'flex',
                margin: 'auto',
              }}
            >
              <CardMedia
                component="img"
                alt={article.title}
                height="200"
                image={article.cover}
                sx={{ width: { xs: '40%', sm: '40%', md: '30%', lg: '30%' } }}
              />
              <CardContent sx={{ width: { xs: '60%', sm: '60%', md: '70%', lg: '70%' }, textAlign: 'left', padding: '16px' }}>
                <Typography variant="h6">{article.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {article.description}
                </Typography>
                <Button variant="contained" color="primary">
                  Read More
                </Button>
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
