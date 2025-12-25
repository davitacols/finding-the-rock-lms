import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip
} from '@mui/material';
import { Add, Forum, Person, School } from '@mui/icons-material';
import { discussionService } from '../services/discussionService';
import LoadingSpinner from './LoadingSpinner';

function DiscussionForum({ moduleId }) {
  const [openNewTopic, setOpenNewTopic] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [newTopicData, setNewTopicData] = useState({ title: '', description: '' });
  const [newPost, setNewPost] = useState('');
  const queryClient = useQueryClient();

  const { data: discussions, isLoading } = useQuery(
    ['discussions', moduleId],
    () => discussionService.getModuleDiscussions(moduleId),
    { enabled: !!moduleId }
  );

  const { data: discussionDetail } = useQuery(
    ['discussion', selectedDiscussion],
    () => discussionService.getDiscussion(selectedDiscussion),
    { enabled: !!selectedDiscussion }
  );

  const createTopicMutation = useMutation(
    (data) => discussionService.createDiscussion({ ...data, moduleId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['discussions', moduleId]);
        setOpenNewTopic(false);
        setNewTopicData({ title: '', description: '' });
      }
    }
  );

  const createPostMutation = useMutation(
    ({ discussionId, content }) => discussionService.createPost(discussionId, { content }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['discussion', selectedDiscussion]);
        setNewPost('');
      }
    }
  );

  const handleCreateTopic = () => {
    createTopicMutation.mutate(newTopicData);
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      createPostMutation.mutate({
        discussionId: selectedDiscussion,
        content: newPost
      });
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading discussions..." />;

  // Sample discussion data when API is not available
  const sampleDiscussions = [
    {
      id: 1,
      title: 'What does faith mean to you personally?',
      description: 'Share your personal understanding of faith and how it has impacted your life. Consider discussing moments when your faith was tested or strengthened.',
      first_name: 'Pastor',
      last_name: 'Johnson',
      role: 'instructor',
      post_count: 8
    },
    {
      id: 2,
      title: 'Effective Prayer Practices',
      description: 'Discuss different prayer methods you have tried or would like to explore. What has been most meaningful in your prayer life?',
      first_name: 'Pastor',
      last_name: 'Johnson',
      role: 'instructor',
      post_count: 5
    },
    {
      id: 3,
      title: 'Understanding God\'s Grace in Daily Life',
      description: 'How do you experience God\'s grace in your everyday situations? Share specific examples of how grace has transformed your perspective or actions.',
      first_name: 'Pastor',
      last_name: 'Johnson',
      role: 'instructor',
      post_count: 12
    }
  ];

  const displayDiscussions = discussions?.data || sampleDiscussions;

  if (selectedDiscussion && (discussionDetail || sampleDiscussions.find(d => d.id === selectedDiscussion))) {
    const discussion = discussionDetail?.data?.discussion || sampleDiscussions.find(d => d.id === selectedDiscussion);
    const posts = discussionDetail?.data?.posts || [
      {
        id: 1,
        content: 'Faith to me is like an anchor in stormy seas. It provides stability when life gets uncertain. I\'ve found that my faith grows stronger through challenges, not despite them. When I lost my job last year, instead of losing hope, I learned to trust God\'s timing and provision.',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        content: 'I see faith as a relationship rather than just belief. It\'s about walking with God daily, not just believing He exists. My faith has taught me to see beyond my circumstances and trust in God\'s greater plan for my life.',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'student',
        created_at: new Date().toISOString()
      }
    ];
    
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            onClick={() => setSelectedDiscussion(null)}
            variant="outlined"
            size="small"
          >
            ← Back to Topics
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#A1F360' }}>
                <School sx={{ color: '#2C2C2C' }} />
              </Avatar>
              <Box>
                <Typography variant="h6">{discussion.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  By {discussion.first_name} {discussion.last_name} • {discussion.role}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1">{discussion.description}</Typography>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Student Responses ({posts.length})
        </Typography>

        <List>
          {posts.map((post, index) => (
            <Box key={post.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ backgroundColor: '#f0f0f0' }}>
                  <Person sx={{ color: '#666' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2">
                      {post.first_name} {post.last_name}
                    </Typography>
                    <Chip 
                      label={post.role} 
                      size="small" 
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {post.content}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </List>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Submit Your Response</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Share your thoughts on this topic..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleCreatePost}
              disabled={!newPost.trim() || createPostMutation.isLoading}
              sx={{ 
                backgroundColor: '#A1F360',
                color: '#2C2C2C',
                '&:hover': { backgroundColor: '#8FE040' }
              }}
            >
              Post Response
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Discussion Forum</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenNewTopic(true)}
          sx={{ 
            backgroundColor: '#A1F360',
            color: '#2C2C2C',
            '&:hover': { backgroundColor: '#8FE040' }
          }}
        >
          New Topic
        </Button>
      </Box>

      {displayDiscussions && displayDiscussions.length > 0 ? (
        <List>
          {displayDiscussions.map((discussion) => (
            <Card key={discussion.id} sx={{ mb: 2 }}>
              <ListItem 
                button 
                onClick={() => setSelectedDiscussion(discussion.id)}
                sx={{ p: 3 }}
              >
                <Avatar sx={{ mr: 2, backgroundColor: '#A1F360' }}>
                  <Forum sx={{ color: '#2C2C2C' }} />
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{discussion.title}</Typography>
                      <Chip 
                        label={`${discussion.post_count} responses`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {discussion.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created by {discussion.first_name} {discussion.last_name} • {discussion.role}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Card>
          ))}
        </List>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Forum sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No discussion topics yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Instructors will post discussion topics here for student participation
            </Typography>
          </CardContent>
        </Card>
      )}

      <Dialog open={openNewTopic} onClose={() => setOpenNewTopic(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Discussion Topic</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Topic Title"
            value={newTopicData.title}
            onChange={(e) => setNewTopicData({ ...newTopicData, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Topic Description"
            value={newTopicData.description}
            onChange={(e) => setNewTopicData({ ...newTopicData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewTopic(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTopic}
            variant="contained"
            disabled={!newTopicData.title.trim() || createTopicMutation.isLoading}
            sx={{ 
              backgroundColor: '#A1F360',
              color: '#2C2C2C',
              '&:hover': { backgroundColor: '#8FE040' }
            }}
          >
            Create Topic
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DiscussionForum;