import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, FileCheck } from "lucide-react"; // Added Upload, FileCheck

export default function CreateChallengeModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starter_code_zip_url: '', // New field for starter code URL
    difficulty: 'mid',
    category: 'fullstack',
    estimated_duration: 90,
    tech_stack: [],
    instructions: '',
    evaluation_criteria: [
      { criterion: 'Code Quality', weight: 25, description: 'Clean, readable, maintainable code' },
      { criterion: 'Architecture', weight: 25, description: 'Well-structured solution design' },
      { criterion: 'Functionality', weight: 25, description: 'Complete and working solution' },
      { criterion: 'AI Tool Usage', weight: 25, description: 'Effective use of AI assistance' }
    ]
  });
  
  const [newTech, setNewTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // New state for upload status
  const [uploadError, setUploadError] = useState(''); // New state for upload errors

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
        setIsUploading(true);
        setUploadError(''); // Clear previous errors
        // const result = await UploadFile({ file }); // TODO: Implement file upload
        try {
            // Assume UploadFile returns an object with file_url
            // const result = await UploadFile({ file });
            setFormData(prev => ({ ...prev, starter_code_zip_url: result.file_url }));
        } catch (error) {
            setUploadError('File upload failed. Please try again.');
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form data after successful submission
      setFormData({
        title: '',
        description: '',
        starter_code_zip_url: '', // Reset starter code URL
        difficulty: 'mid',
        category: 'fullstack',
        estimated_duration: 90,
        tech_stack: [],
        instructions: '',
        evaluation_criteria: [
          { criterion: 'Code Quality', weight: 25, description: 'Clean, readable, maintainable code' },
          { criterion: 'Architecture', weight: 25, description: 'Well-structured solution design' },
          { criterion: 'Functionality', weight: 25, description: 'Complete and working solution' },
          { criterion: 'AI Tool Usage', weight: 25, description: 'Effective use of AI assistance' }
        ]
      });
      onClose(); // Close modal after successful submission and reset
    } catch (error) {
      console.error('Error creating challenge:', error);
      // Optionally set an error message for the user
    }
    setIsSubmitting(false);
  };

  const addTechStack = () => {
    if (newTech && !formData.tech_stack.includes(newTech)) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech]
      }));
      setNewTech('');
    }
  };

  const removeTechStack = (tech) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Challenge</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Challenge Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* New section for Starter Code Upload */}
          <div className="space-y-2">
            <Label htmlFor="starter_code">Starter Code (Optional .zip)</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" asChild>
                <label className="cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload .zip"}
                  <input type="file" accept=".zip" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                </label>
              </Button>
              {formData.starter_code_zip_url && (
                <div className="flex items-center gap-2 text-green-600">
                  <FileCheck className="w-4 h-4" />
                  <span>File uploaded successfully!</span>
                </div>
              )}
            </div>
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="fullstack">Fullstack</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                min="30"
                max="180"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="Add technology..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
              />
              <Button type="button" onClick={addTechStack} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeTechStack(tech)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions for Candidates</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows={4}
              placeholder="Detailed instructions for the candidate..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading} // Disable submit if uploading
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
