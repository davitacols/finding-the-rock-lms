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
  Chip,
  Rating,
  Paper,
  Divider,
  Grid
} from '@mui/material';
import { Assignment, Person, RateReview, Send, CheckCircle } from '@mui/icons-material';
import { peerAssessmentService } from '../services/peerAssessmentService';
import LoadingSpinner from './LoadingSpinner';

function PeerAssessment({ moduleId }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    feedback: '',
    criteriaScores: {
      authenticity: 0,
      biblical_insight: 0,
      personal_application: 0,
      writing_quality: 0
    }
  });
  const queryClient = useQueryClient();

  // Sample data when API is not available
  const sampleTopics = [
    {
      id: 1,
      title: 'Personal Faith Journey Reflection',
      description: 'Reflect on your personal faith journey and share a significant moment that strengthened or challenged your faith.',
      instructions: 'Write a 200-500 word reflection discussing: 1) A specific experience that impacted your faith, 2) How this experience changed your perspective, 3) What you learned about God\'s character through this experience.',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      peer_review_due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      submission_count: 12,
      user_submitted: 1
    },
    {
      id: 2,
      title: 'Prayer Life Assessment',
      description: 'Analyze your current prayer practices and discuss how you can develop a more meaningful prayer life.',
      instructions: 'Write a 200-500 word analysis covering: 1) Your current prayer habits, 2) Challenges you face, 3) Strategies for improvement, 4) Expected spiritual growth impact.',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      peer_review_due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      submission_count: 8,
      user_submitted: 0
    }
  ];

  const sampleSubmissions = [
    {
      id: 1,
      content: 'My faith journey took a significant turn during my college years when I faced financial hardship. I was working two jobs while studying full-time, barely making ends meet. During this challenging period, I questioned whether God truly cared about my struggles. One evening, feeling overwhelmed and defeated, I received an unexpected call from my church offering me a scholarship I had forgotten I applied for months earlier. This moment taught me that God\'s timing is perfect, even when we cannot see His plan. The experience strengthened my faith and taught me to trust in God\'s provision, even during uncertainty.',
      first_name: 'John',
      last_name: 'Doe',
      avg_rating: 4.2,
      review_count: 3,
      user_reviewed: 0,
      word_count: 247
    },
    {
      id: 2,
      content: 'Faith has always been a cornerstone of my life, but it was truly tested when my mother was diagnosed with cancer two years ago. Watching her suffer while maintaining her unwavering trust in God challenged my understanding of His goodness. Through this experience, I learned that faith isn\'t about avoiding hardship but finding God\'s presence within it. My mother\'s peaceful demeanor and continued praise during treatment showed me that true faith transforms how we face adversity. This experience deepened my relationship with God and taught me that His love isn\'t measured by our circumstances but by His constant presence with us.',
      first_name: 'Sarah',
      last_name: 'Johnson',
      avg_rating: 4.8,
      review_count: 4,
      user_reviewed: 0,
      word_count: 298
    }
  ];

  const { data: topics, isLoading } = useQuery(
    ['peerTopics', moduleId],
    () => peerAssessmentService.getModuleTopics(moduleId),
    { enabled: !!moduleId }
  );

  const { data: topicDetail } = useQuery(
    ['peerTopic', selectedTopic],
    () => peerAssessmentService.getTopic(selectedTopic),
    { enabled: !!selectedTopic }
  );

  const submitMutation = useMutation(
    ({ topicId, content }) => peerAssessmentService.submitResponse(topicId, content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['peerTopic', selectedTopic]);
        setSubmissionText('');
      }
    }
  );

  const reviewMutation = useMutation(
    ({ submissionId, data }) => peerAssessmentService.submitReview(submissionId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['peerTopic', selectedTopic]);
        setReviewDialog(false);
        setReviewData({
          rating: 0,
          feedback: '',
          criteriaScores: { authenticity: 0, biblical_insight: 0, personal_application: 0, writing_quality: 0 }
        });
      }
    }
  );

  const handleSubmit = () => {
    if (submissionText.trim()) {
      submitMutation.mutate({ topicId: selectedTopic, content: submissionText });
    }
  };

  const handleReview = (submission) => {
    setSelectedSubmission(submission);
    setReviewDialog(true);
  };

  const submitReview = () => {
    reviewMutation.mutate({
      submissionId: selectedSubmission.id,
      data: reviewData
    });
  };

  if (isLoading) return <LoadingSpinner message="Loading peer assessments..." />;

  const displayTopics = topics?.data || sampleTopics;

  if (selectedTopic) {
    const topic = topicDetail?.data?.topic || sampleTopics.find(t => t.id === selectedTopic);
    const userSubmission = topicDetail?.data?.userSubmission;
    const submissions = topicDetail?.data?.submissions || sampleSubmissions;

    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 2 }}>
          <Button onClick={() => setSelectedTopic(null)} variant="outlined" size="small">
            ← Back to Topics
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>{topic.title}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{topic.description}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Instructions:</strong> {topic.instructions}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label={`Due: ${new Date(topic.due_date).toLocaleDateString()}`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Peer Review Due: ${new Date(topic.peer_review_due_date).toLocaleDateString()}`} 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
          </CardContent>
        </Card>

        {!userSubmission ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Submit Your Response</Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="Write your response here... (200-500 words)"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Word count: {submissionText.split(/\s+/).filter(word => word.length > 0).length}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!submissionText.trim() || submitMutation.isLoading}
                  sx={{ 
                    backgroundColor: '#A1F360',
                    color: '#2C2C2C',
                    '&:hover': { backgroundColor: '#8FE040' }
                  }}
                >
                  Submit Response
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircle sx={{ color: '#A1F360' }} />
                <Typography variant="h6">Your Submission</Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {userSubmission.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submitted: {new Date(userSubmission.submitted_at).toLocaleDateString()} • 
                Word count: {userSubmission.word_count}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Typography variant="h6" sx={{ mb: 2 }}>
          Peer Submissions to Review ({submissions.length})
        </Typography>

        {submissions.map((submission) => (
          <Card key={submission.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: '#f0f0f0' }}>
                    <Person sx={{ color: '#666' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {submission.first_name} {submission.last_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={submission.avg_rating || 0} readOnly size="small" />
                      <Typography variant="caption">
                        ({submission.review_count} reviews)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {!submission.user_reviewed && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RateReview />}
                    onClick={() => handleReview(submission)}
                    sx={{ borderColor: '#A1F360', color: '#A1F360' }}
                  >
                    Review
                  </Button>
                )}
              </Box>
              
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {submission.content}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                Word count: {submission.word_count}
              </Typography>
            </CardContent>
          </Card>
        ))}

        <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Review Submission</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Overall Rating</Typography>
                <Rating
                  value={reviewData.rating}
                  onChange={(e, value) => setReviewData({ ...reviewData, rating: value })}
                  size="large"
                />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Authenticity</Typography>
                <Rating
                  value={reviewData.criteriaScores.authenticity}
                  onChange={(e, value) => setReviewData({
                    ...reviewData,
                    criteriaScores: { ...reviewData.criteriaScores, authenticity: value }
                  })}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Biblical Insight</Typography>
                <Rating
                  value={reviewData.criteriaScores.biblical_insight}
                  onChange={(e, value) => setReviewData({
                    ...reviewData,
                    criteriaScores: { ...reviewData.criteriaScores, biblical_insight: value }
                  })}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Personal Application</Typography>
                <Rating
                  value={reviewData.criteriaScores.personal_application}
                  onChange={(e, value) => setReviewData({
                    ...reviewData,
                    criteriaScores: { ...reviewData.criteriaScores, personal_application: value }
                  })}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Writing Quality</Typography>
                <Rating
                  value={reviewData.criteriaScores.writing_quality}
                  onChange={(e, value) => setReviewData({
                    ...reviewData,
                    criteriaScores: { ...reviewData.criteriaScores, writing_quality: value }
                  })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Feedback"
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                  placeholder="Provide constructive feedback to help your peer improve..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
            <Button
              onClick={submitReview}
              variant="contained"
              disabled={!reviewData.rating || reviewMutation.isLoading}
              sx={{ 
                backgroundColor: '#A1F360',
                color: '#2C2C2C',
                '&:hover': { backgroundColor: '#8FE040' }
              }}
            >
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" sx={{ mb: 3 }}>Peer Assessment</Typography>
      
      {displayTopics.length > 0 ? (
        <List>
          {displayTopics.map((topic) => (
            <Card key={topic.id} sx={{ mb: 2 }}>
              <ListItem button onClick={() => setSelectedTopic(topic.id)} sx={{ p: 3 }}>
                <Avatar sx={{ mr: 2, backgroundColor: '#A1F360' }}>
                  <Assignment sx={{ color: '#2C2C2C' }} />
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{topic.title}</Typography>
                      {topic.user_submitted ? (
                        <Chip label="Submitted" size="small" sx={{ backgroundColor: '#A1F360', color: '#2C2C2C' }} />
                      ) : (
                        <Chip label="Pending" size="small" color="warning" variant="outlined" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {topic.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`${topic.submission_count} submissions`} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={`Due: ${new Date(topic.due_date).toLocaleDateString()}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Box>
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
            <Assignment sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No peer assessment topics available
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default PeerAssessment;