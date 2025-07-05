import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Mail, 
  MessageCircle, 
  Video, 
  FileSpreadsheet, 
  HardDrive, 
  FileText, 
  Presentation, 
  Code2, 
  Workflow, 
  Bot, 
  MessageSquare, 
  Briefcase 
} from "lucide-react";

interface LaunchButton {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const launchButtons: LaunchButton[] = [
  { name: "Gmail", url: "https://mail.google.com", icon: <Mail size={24} />, color: "bg-overproof-red" },
  { name: "Google Chat", url: "https://chat.google.com", icon: <MessageCircle size={24} />, color: "bg-overproof-blue" },
  { name: "Google Meet", url: "https://meet.google.com", icon: <Video size={24} />, color: "bg-gradient-brand" },
  { name: "Sheets", url: "https://sheets.google.com", icon: <FileSpreadsheet size={24} />, color: "bg-overproof-navy" },
  { name: "Drive", url: "https://drive.google.com", icon: <HardDrive size={24} />, color: "bg-overproof-blue" },
  { name: "Docs", url: "https://docs.google.com", icon: <FileText size={24} />, color: "bg-overproof-red" },
  { name: "Slides", url: "https://slides.google.com", icon: <Presentation size={24} />, color: "bg-gradient-navy" },
  { name: "Lovable", url: "https://lovable.dev", icon: <Code2 size={24} />, color: "bg-gradient-brand" },
  { name: "n8n", url: "https://n8n.io", icon: <Workflow size={24} />, color: "bg-overproof-blue" },
  { name: "Claude", url: "https://claude.ai", icon: <Bot size={24} />, color: "bg-overproof-navy" },
  { name: "ChatGPT", url: "https://chat.openai.com", icon: <MessageSquare size={24} />, color: "bg-overproof-red" },
  { name: "Upwork", url: "https://upwork.com", icon: <Briefcase size={24} />, color: "bg-gradient-brand" },
];

export const LaunchButtons = () => {
  return (
    <Card className="p-6 shadow-soft border-border/50">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">Quick Launch</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {launchButtons.map((button) => (
          <Button
            key={button.name}
            variant="outline"
            size="lg"
            className={`${button.color} text-white border-0 hover:scale-105 hover:shadow-elevated transition-all duration-300 h-20 flex flex-col gap-2 font-medium`}
            onClick={() => window.open(button.url, '_blank')}
          >
            {button.icon}
            <span className="text-sm font-medium">{button.name}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};