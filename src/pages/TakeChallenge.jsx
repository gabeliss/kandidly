import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInterviewById, updateInterview, fetchChallengeById, uploadSubmissionFile } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Code2, Clock, Download, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, parseISO } from 'date-fns';

const CountdownTimer = ({ expiryTimestamp, onExpire }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryTimestamp) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (Object.keys(newTimeLeft).length === 0) {
                onExpire();
            }
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = [];
    Object.keys(timeLeft).forEach((interval, idx, arr) => {
        if (!timeLeft[interval] && interval !== 'seconds' && timerComponents.length === 0) return;
        timerComponents.push(
            <span key={interval} className="text-2xl font-mono">
                {String(timeLeft[interval]).padStart(2, '0')}{interval[0]}
            </span>
        );
        if (idx < arr.length - 1) {
            timerComponents.push(
                <span key={interval + '-sep'} className="text-2xl font-mono mx-1">:</span>
            );
        }
    });

    return (
        <div className="flex gap-2">
            {timerComponents.length ? timerComponents : <span>Time's up!</span>}
        </div>
    );
};

export default function TakeChallengePage() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submissionInstructions, setSubmissionInstructions] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const interviewData = await fetchInterviewById(interviewId);
                if (!interviewData) {
                    setError('Interview not found. Please check your link or contact your recruiter.');
                    setIsLoading(false);
                    return;
                }
                if (new Date() > new Date(interviewData.expires_date) && interviewData.status === 'sent') {
                    await updateInterview(interviewData.id, { status: 'expired' });
                    setError('This challenge link has expired.');
                    setInterview({ ...interviewData, status: 'expired' });
                    setIsLoading(false);
                    return;
                }
                setInterview(interviewData);
                const challengeData = await fetchChallengeById(interviewData.challenge_id);
                if (!challengeData) {
                    setError('Challenge not found. Please contact your recruiter.');
                    setIsLoading(false);
                    return;
                }
                setChallenge(challengeData);
            } catch (e) {
                setError('Failed to load challenge details. Please try again later or contact support.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        if (interviewId) {
            loadData();
        } else {
            setError('Invalid challenge link.');
            setIsLoading(false);
        }
    }, [interviewId]);

    const handleStartChallenge = async () => {
        const startedDate = new Date().toISOString();
        await updateInterview(interview.id, { status: 'started', started_date: startedDate });
        setInterview(prev => ({ ...prev, status: 'started', started_date: startedDate }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile) {
            alert("Please select a file to upload.");
            return;
        }
        setIsSubmitting(true);
        try {
            // Upload the file to Supabase Storage
            const fileUrl = await uploadSubmissionFile(submissionFile, interview.id);
            await updateInterview(interview.id, {
                status: 'submitted',
                submission_zip_url: fileUrl,
                submission_instructions: submissionInstructions,
                submitted_date: new Date().toISOString()
            });
            setInterview(prev => ({ ...prev, status: 'submitted' }));
        } catch (err) {
            alert('Submission failed. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleTimeExpire = async () => {
        if(interview.status === 'started') {
            await updateInterview(interview.id, { status: 'expired' });
            setInterview(prev => ({ ...prev, status: 'expired' }));
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Skeleton className="w-96 h-96" /></div>;
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full shadow-lg">
                    <CardHeader><CardTitle className="text-red-600 flex items-center gap-2"><AlertTriangle/>Error</CardTitle></CardHeader>
                    <CardContent><p className="text-gray-700">{error}</p></CardContent>
                </Card>
            </div>
        );
    }
    
    if (!challenge) return null;

    if (interview.status === 'submitted') {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-lg w-full shadow-lg text-center">
                    <CardHeader>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                        <CardTitle className="text-2xl">Submission Successful!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Your solution has been submitted. The team at {interview.company} will review it shortly. You can now close this window.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (interview.status === 'expired') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full shadow-lg">
                    <CardHeader><CardTitle className="text-orange-600 flex items-center gap-2"><Clock/>Expired</CardTitle></CardHeader>
                    <CardContent><p className="text-gray-700">This challenge has expired.</p></CardContent>
                </Card>
            </div>
        );
    }

    if (interview.status === 'sent') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-2xl w-full shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <Code2 className="w-6 h-6 text-white" />
                             </div>
                             <div>
                                <p className="text-sm text-gray-500">Coding Challenge from</p>
                                <h2 className="font-bold text-xl">{interview.company}</h2>
                             </div>
                        </div>
                        <CardTitle className="text-3xl pt-4">{challenge.title}</CardTitle>
                        <p className="text-gray-600">For the position of {interview.position}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700">{challenge.description}</p>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Clock className="w-5 h-5"/>
                            <span>{challenge.estimated_duration} minutes</span>
                        </div>
                        <p className="text-sm text-gray-500">The timer will start as soon as you click the button below and cannot be paused.</p>
                        <Button onClick={handleStartChallenge} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg">
                            Start Challenge
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (interview.status === 'started') {
        const expiryTime = new Date(new Date(interview.started_date).getTime() + challenge.estimated_duration * 60000);
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md mb-8 sticky top-4 z-10">
                        <h1 className="text-2xl font-bold text-gray-800">{challenge.title}</h1>
                        <div className="text-red-600 font-semibold">
                            <CountdownTimer expiryTimestamp={expiryTime} onExpire={handleTimeExpire} />
                        </div>
                    </header>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Challenge Prompt</CardTitle></CardHeader>
                                <CardContent className="prose max-w-none">
                                    <h3 className="text-lg font-semibold">Description</h3>
                                    <p>{challenge.description}</p>
                                    <h3 className="text-lg font-semibold mt-4">Instructions</h3>
                                    <p className="whitespace-pre-wrap">{challenge.instructions}</p>
                                </CardContent>
                            </Card>
                            {challenge.starter_code_zip_url && (
                                <Card>
                                    <CardHeader><CardTitle>Starter Code</CardTitle></CardHeader>
                                    <CardContent>
                                        <Button asChild variant="outline">
                                            <a href={challenge.starter_code_zip_url} download className="gap-2">
                                                <Download className="w-4 h-4"/> Download starter.zip
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Submit Your Solution</CardTitle></CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="submission-file">Upload Code (.zip)</Label>
                                            <Input id="submission-file" type="file" accept=".zip" onChange={(e) => setSubmissionFile(e.target.files[0])} required/>
                                        </div>
                                        <div>
                                            <Label htmlFor="instructions">README / Run Instructions</Label>
                                            <Textarea
                                                id="instructions"
                                                rows={8}
                                                value={submissionInstructions}
                                                onChange={(e) => setSubmissionInstructions(e.target.value)}
                                                placeholder="Provide any instructions needed to set up and run your code..."
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600">
                                            <Upload className="w-4 h-4"/>
                                            {isSubmitting ? 'Submitting...' : 'Submit Final Solution'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
