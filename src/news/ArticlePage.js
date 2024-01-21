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
    <div>
        <div style={{ backgroundColor: '#84a18d', color: '#fff', minHeight: '10vh', padding: '30px', border: '3px solid black' }}>
          <Paper elevation={10} style={{ maxWidth: '1200px', padding: '20px', margin: '20px', position: 'relative', border: '3px solid black', }}>
            <img
              src={getImageUrl(article.cover)}
              alt={article.title}
              style={{ width: '100%', height: 'auto', marginBottom: '20px', borderRadius: '8px' }}
            />
            <div style={{flex: 1, padding: '10px', textAlign: 'center'}}>
              <Typography variant="h4" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                {article.title}
              </Typography>
              <Typography variant="caption" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                {article.timestamp}
              </Typography>
            </div>
          </Paper>
        </div>
        <div style={{ backgroundColor: 'pink', color: '#fff', minHeight: '10vh', padding: '30px', border: '3px solid black', }}>
          <Typography variant="body1" paragraph style={{ maxWidth: '1200px', marginBottom: '15px' }}>
            {article.description}
          </Typography>
        </div>
        {article.cover_section_1 && (
          <div style={{ backgroundColor: 'yellow', color: '#fff', minHeight: '10vh', padding: '30px', border: '3px solid black' }}>
            <Paper elevation={10} style={{ maxWidth: '1200px', padding: '20px', margin: '20px', position: 'relative', border: '3px solid black' }}>
              <img
                src={getImageUrl(article.cover_section_1)}
                alt={article.title}
                style={{ width: '100%', height: 'auto', marginBottom: '20px', borderRadius: '8px' }}
              />
              <div style={{flex: 1, padding: '10px', textAlign: 'center'}}>
                <Typography variant="h4" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                  {article.subtitle_1}
                </Typography>
              </div>
            </Paper>
          </div>
        )}
        {article.description_1 && (
          <div style={{ backgroundColor: 'snow', color: 'black', minHeight: '10vh', padding: '30px', border: '3px solid black', }}>
            <Typography variant="body1" paragraph style={{ maxWidth: '1200px', marginBottom: '15px' }}>
              {article.description_1}
            </Typography>
          </div>
        )}
        {article.cover_section_2 && (
        <div style={{ backgroundColor: 'white', color: '#fff', minHeight: '10vh', padding: '30px', border: '3px solid black' }}>
          <Paper elevation={10} style={{ backgroundColor: 'purple', maxWidth: '1200px', padding: '20px', margin: '20px', position: 'relative', border: '3px solid black' }}>
            <img
              src={getImageUrl(article.cover_section_2)}
              alt={article.title}
              style={{ width: '100%', height: 'auto', marginBottom: '20px', borderRadius: '8px', border: '3px solid black' }}
            />
            <div style={{flex: 1, padding: '10px', textAlign: 'center'}}>
              <Typography variant="h4" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                {article.subtitle_2}
              </Typography>
            </div>
          </Paper>
        </div>
        )}
        {article.description_2 && (
          <div style={{ backgroundColor: 'grey', color: 'white', minHeight: '10vh', padding: '30px', border: '3px solid black' }}>
            <Typography variant="body1" paragraph style={{ maxWidth: '1200px', marginBottom: '15px' }}>
              {article.description_2}
            </Typography>
          </div>
        )}
        <div style={{ backgroundColor: 'snow', color: 'black', minHeight: '10vh', padding: '30px', border: '3px solid black', textAlign: 'center' }}>
            <Typography variant="body1" paragraph style={{ maxWidth: '1200px', marginBottom: '15px' }}>
              Comment Section
            </Typography>
        </div>
      </div>
    
  );
};

export default ArticlePage;
