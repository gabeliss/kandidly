import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, User, Building, Copy, Check, Calendar } from "lucide-react";
import { getUser } from '../../api/auth';
import { supabase } from '../../api/supabase';

export default function SendChallengeModal({ isOpen, onClose, onSubmit, challenges, preSelectedChallenge }) {
  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    position: '',
    challenge_id: preSelectedChallenge?.id || '',
    notes: '',
    expires_date: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Update challenge_id when preSelectedChallenge changes
  useEffect(() => {
    if (preSelectedChallenge) {
      setFormData(prev => ({ ...prev, challenge_id: preSelectedChallenge.id }));
    }
  }, [preSelectedChallenge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Fetch current user and company
      const authUser = await getUser();
      const { data: dbUser, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();
      if (userErr) throw userErr;
      const interviewPayload = {
        ...formData,
        company_id: dbUser.company_id,
        created_by: dbUser.id,
        status: 'created'
      };
      await onSubmit(interviewPayload);
      const mockId = Math.random().toString(36).substring(2, 10);
      setGeneratedLink(`${window.location.origin}${window.location.pathname}take-challenge/${mockId}`);
    } catch (error) {
      console.error('Error sending challenge:', error);
    }
    setIsSubmitting(false);
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setGeneratedLink('');
    setFormData({
      candidate_name: '',
      candidate_email: '',
      position: '',
      challenge_id: preSelectedChallenge?.id || '', // Reset challenge_id based on preSelectedChallenge if it exists
      notes: '',
      expires_date: ''
    });
    onClose();
  }

  const selectedChallenge = challenges.find(c => c.id === formData.challenge_id) || preSelectedChallenge;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5" />
            Schedule Interview
          </DialogTitle>
        </DialogHeader>
        
        {generatedLink ? (
          <div className="space-y-4 py-4">
              <h3 className="text-lg font-medium text-center">Challenge Link Generated!</h3>
              <p className="text-sm text-gray-500 text-center">Share this link with the candidate to start their challenge.</p>
              <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                <Input value={generatedLink} readOnly className="border-none bg-transparent shadow-none" />
                <Button size="sm" onClick={handleCopyToClipboard} className="gap-1">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <User className="w-5 h-5" />
                Candidate Information
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_name">Full Name</Label>
                  <Input id="candidate_name" value={formData.candidate_name} onChange={(e) => setFormData(prev => ({ ...prev, candidate_name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate_email">Email Address</Label>
                  <Input id="candidate_email" type="email" value={formData.candidate_email} onChange={(e) => setFormData(prev => ({ ...prev, candidate_email: e.target.value }))} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" value={formData.position} onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))} placeholder="e.g. Senior Frontend Developer" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expires_date">Expiry Date</Label>
                  <Input
                    id="expires_date"
                    type="datetime-local"
                    value={formData.expires_date}
                    onChange={e => setFormData(prev => ({ ...prev, expires_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Challenge</Label>
              {preSelectedChallenge ? (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{preSelectedChallenge.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{preSelectedChallenge.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{preSelectedChallenge.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">{preSelectedChallenge.category}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <Select value={formData.challenge_id} onValueChange={(value) => setFormData(prev => ({ ...prev, challenge_id: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select a challenge" /></SelectTrigger>
                  <SelectContent>
                    {challenges.map((challenge) => (
                      <SelectItem key={challenge.id} value={challenge.id}>
                        <div className="flex items-center gap-2">
                          <span>{challenge.title}</span>
                          <Badge variant="outline" className="text-xs">{challenge.difficulty}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600">
                {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
