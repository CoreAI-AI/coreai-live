import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b border-border p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Privacy Policy</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6 space-y-4">
            <section>
              <h2 className="text-xl font-semibold mb-3">Data Collection</h2>
              <p className="text-muted-foreground">
                CoreAI collects and stores the following data:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2 text-muted-foreground">
                <li>Chat conversations and messages</li>
                <li>Generated images and prompts</li>
                <li>Uploaded documents</li>
                <li>Notes and summaries</li>
                <li>User preferences and settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Model Usage</h2>
              <p className="text-muted-foreground">
                CoreAI uses two types of AI models:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2 text-muted-foreground">
                <li><strong>Hosted Models:</strong> Processed via Lovable AI Gateway. Your prompts are sent to third-party AI providers.</li>
                <li><strong>Local Models:</strong> Run on your own infrastructure. Data never leaves your server when using local models.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Storage</h2>
              <p className="text-muted-foreground">
                All data is stored securely using Supabase (PostgreSQL database with encryption at rest).
                Storage is isolated per user with Row-Level Security (RLS) policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Security</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>No API keys are exposed in client-side code</li>
                <li>All sensitive operations go through secure edge functions</li>
                <li>User data is protected by authentication and RLS policies</li>
                <li>Connections use HTTPS encryption</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Ownership</h2>
              <p className="text-muted-foreground">
                You own all data you create in CoreAI. You can export or delete your data at any time
                through the Settings menu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
              <p className="text-muted-foreground">
                When using hosted AI models, your prompts are sent to:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2 text-muted-foreground">
                <li>Google (Gemini models)</li>
                <li>OpenAI (GPT models)</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                These services have their own privacy policies. CoreAI does not control how they process data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p className="text-muted-foreground">
                For privacy-related questions or to request data deletion, please contact your system administrator.
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;