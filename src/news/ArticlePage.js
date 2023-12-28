import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';
import { Paper, Typography, Grid, Button } from '@mui/material';

const ArticlePage = () => {
  const [article, setArticle] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/article/read/?id=${id}`);
        const data = await response.json();
        setArticle(data);
        console.log(data)
      } catch (error) {
        console.error('Error fetching article details:', error);
      }
    };

    fetchArticleDetails();
  }, [id]);

  if (!article) {
    return <div>Loading...</div>;
  }

  const getImageUrl = (relativePath) => {
    return `http://127.0.0.1:8000${relativePath}`;
  };

  console.log(article.cover)
  return (
    <Paper>
      <img src={getImageUrl(article.cover)} alt={article.title} />
      <Typography variant="h4">{article.title}</Typography>
      <Typography variant="body1" paragraph>
        {article.description}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {article.timestamp}
      </Typography>
    </Paper>
  );
};

export default ArticlePage;
