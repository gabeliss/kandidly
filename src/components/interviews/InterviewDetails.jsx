import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Building, ExternalLink, Star, Brain, Download, FileText, Zap, AlertTriangle, Copy } from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { updateInterview } from '@/api/entities';
import { Skeleton } from '@/components/ui/skeleton';

export default function InterviewDetails({ interview, challenges, onUpdate }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!interview || !interview.submission_zip_url) return;
    setIsAnalyzing(true);
    await updateInterview(interview.id, { status: "evaluating" });
    onUpdate();

    const challenge = challenges.find(c => c.id === interview.challenge_id);
    const prompt = `
      You are an expert technical interviewer and senior software engineer. Analyze the following coding challenge submission.
      
      CHALLENGE:
      Title: ${challenge.title}
      Description: ${challenge.description}
      Instructions: ${challenge.instructions}

      CANDIDATE SUBMISSION:
      Instructions/README: ${interview.submission_instructions}
      The code is provided in the attached zip file.

      Please provide a concise analysis based on the following criteria:
      1.  **Code Quality & Maintainability**: Is the code clean, readable, and well-structured? Are there comments? Is it easy to understand and modify?
      2.  **Functionality & Correctness**: Does the solution meet the requirements of the challenge prompt? Are there any obvious bugs or edge cases missed?
      3.  **Architecture & Design**: Is the solution well-architected? Does it follow good design patterns? Is the project structure logical?
      4.  **Problem Solving**: How did the candidate approach the problem? Is their solution creative or efficient?
      5.  **Overall Recommendation**: Based on this submission, provide a recommendation (strong_hire, hire, no_hire, strong_no_hire) and a summary.

      Keep your analysis professional, constructive, and concise. Focus on the code and its merits.
    `;

    try {
      // const result = await InvokeLLM({ // TODO: Implement LLM invocation
      await updateInterview(interview.id, {
        status: "evaluated",
        evaluation: {
          ai_analysis: "AI analysis not implemented",
          recommendation: "no_hire",
          overall_score: 0
        }
      });
      onUpdate();
    } catch (error) {
      console.error("AI Analysis failed:", error);
      await updateInterview(interview.id, { status: "submitted" });
       onUpdate();
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function handleSendInterview() {
    setSending(true);
    setSendError('');
    setSendSuccess(false);
    try {
      // Fetch current user (hiring manager)
      const authUser = await getUser();
      // Compose email
      const to = interview.candidate_email;
      const from = authUser.email;
      const subject = `Interview Invitation: ${interview.position}`;
      const link = `${window.location.origin}/take-challenge/${interview.id}`;
      const html = `<p>You have been invited to an interview for the position of <strong>${interview.position}</strong>.<br/>Click <a href='${link}'>here</a> to begin your challenge.</p>`;
      // Call backend
      const res = await fetch('/api/sendInterview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, from, subject, html })
      });
      if (!res.ok) throw new Error('Failed to send email');
      await updateInterview(interview.id, { status: 'sent' });
      setSendSuccess(true);
      onUpdate();
    } catch (err) {
      setSendError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  }

  if (!interview) {
    return (
      <Card className="border-0 shadow-lg sticky top-8">
        <CardContent className="p-8 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select an interview to view details</p>
        </CardContent>
      </Card>
    );
  }

  const challenge = challenges.find(c => c.id === interview.challenge_id);

  return (
    <Card className="border-0 shadow-lg sticky top-8">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg font-bold text-gray-900">
          Interview Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Candidate Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Candidate Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{interview.candidate_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{interview.position} at {interview.company}</span>
            </div>
            <div className="text-gray-600">
              {interview.candidate_email}
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Timeline</h4>
          <div className="space-y-2 text-sm">
            {interview.sent_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Sent: {format(parseISO(interview.sent_date), "MMM d, yyyy")}</span>
              </div>
            )}
            {interview.expires_date && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Expires: {format(parseISO(interview.expires_date), "MMM d, yyyy")}</span>
              </div>
            )}
            {interview.started_date && (
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>Started: {formatDistanceToNow(parseISO(interview.started_date))} ago</span>
                </div>
            )}
             {interview.submitted_date && (
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Submitted: {formatDistanceToNow(parseISO(interview.submitted_date))} ago</span>
                </div>
            )}
            {/* Original duration and type removed as they refer to synchronous interview context */}
          </div>
        </div>

        {/* Challenge Info */}
        {challenge && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Challenge</h4>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h5 className="font-medium">{challenge.title}</h5>
              <p className="text-sm text-gray-600">{challenge.description}</p>
              <div className="flex gap-2">
                <Badge variant="outline">{challenge.difficulty}</Badge>
                <Badge variant="outline">{challenge.category}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Interview Link */}
        {interview.status === 'created' && (
          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-gray-900">Interview Link</h4>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
              <input
                value={`${window.location.origin}/take-challenge/${interview.id}`}
                readOnly
                className="border-none bg-transparent shadow-none flex-1 text-sm"
              />
              <button
                onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/take-challenge/${interview.id}`)}}
                className="p-2 rounded bg-blue-100 hover:bg-blue-200"
              >
                <Copy className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              onClick={handleSendInterview}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Interview'}
            </button>
            {sendSuccess && <div className="text-green-600 text-sm mt-2">Interview sent!</div>}
            {sendError && <div className="text-red-600 text-sm mt-2">{sendError}</div>}
          </div>
        )}

        {/* Submission Section */}
        {interview.status === 'submitted' || interview.status === 'evaluating' || interview.status === 'evaluated' ? (
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Submission</h4>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div>
                        <h5 className="font-medium text-sm mb-1">README / Instructions</h5>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{interview.submission_instructions || "No instructions provided."}</p>
                    </div>
                    {interview.submission_zip_url && (
                      <Button variant="outline" size="sm" asChild>
                          <a href={interview.submission_zip_url} download className="gap-2">
                              <Download className="w-3 h-3" />
                              Download Code (.zip)
                          </a>
                      </Button>
                    )}
                </div>
            </div>
        ) : (
             <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Awaiting candidate submission</p>
            </div>
        )}

        {/* Evaluation Section */}
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Evaluation
            </h4>
            {interview.status === 'submitted' && !isAnalyzing && (
                <Button onClick={handleAnalyze} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Zap className="w-4 h-4" />
                    Analyze Submission
                </Button>
            )}
            {interview.status === 'evaluating' || isAnalyzing ? (
                 <div className="text-center py-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 animate-pulse" />
                        AI analysis in progress...
                    </p>
                </div>
            ) : null}
            {interview.status === 'evaluated' && interview.evaluation ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Score</span>
                        <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${(interview.evaluation.overall_score / 10) * 100}%` }}
                            />
                        </div>
                        <span className="font-semibold">
                            {interview.evaluation.overall_score}/10
                        </span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Recommendation: {interview.evaluation.recommendation?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-blue-800 capitalize">
                           Overall Score: {interview.evaluation.overall_score}/10
                        </p>
                    </div>
                     <div className="p-3 bg-gray-50 rounded-lg">
                        <h6 className="font-medium text-gray-900 mb-2">Analysis Summary</h6>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {interview.evaluation.ai_analysis}
                        </p>
                    </div>
                </div>
            ) : null}
             {interview.status !== 'submitted' && interview.status !== 'evaluating' && interview.status !== 'evaluated' && (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Analysis available after submission.</p>
                </div>
             )}
        </div>

        {/* Notes */}
        {interview.notes && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {interview.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
            Edit Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
