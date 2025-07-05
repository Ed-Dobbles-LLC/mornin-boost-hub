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
  { name: "Gmail", url: "https://mail.google.com", icon: <Mail size={24} />, color: "bg-gradient-sunrise" },
  { name: "Google Chat", url: "https://chat.google.com", icon: <MessageCircle size={24} />, color: "bg-gradient-fresh" },
  { name: "Google Meet", url: "https://meet.google.com", icon: <Video size={24} />, color: "bg-gradient-ocean" },
  { name: "Sheets", url: "https://sheets.google.com", icon: <FileSpreadsheet size={24} />, color: "bg-forest" },
  { name: "Drive", url: "https://drive.google.com", icon: <HardDrive size={24} />, color: "bg-ocean" },
  { name: "Docs", url: "https://docs.google.com", icon: <FileText size={24} />, color: "bg-sunrise" },
  { name: "Slides", url: "https://slides.google.com", icon: <Presentation size={24} />, color: "bg-lavender" },
  { name: "Lovable", url: "https://lovable.dev", icon: <Code2 size={24} />, color: "bg-gradient-sunrise" },
  { name: "n8n", url: "https://n8n.io", icon: <Workflow size={24} />, color: "bg-gradient-fresh" },
  { name: "Claude", url: "https://claude.ai", icon: <Bot size={24} />, color: "bg-gradient-ocean" },
  { name: "ChatGPT", url: "https://chat.openai.com", icon: <MessageSquare size={24} />, color: "bg-forest" },
  { name: "Upwork", url: "https://upwork.com", icon: <Briefcase size={24} />, color: "bg-sunrise" },
];

export const LaunchButtons = () => {
  return (
    <Card className="p-6 shadow-soft">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Quick Launch</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {launchButtons.map((button) => (
          <Button
            key={button.name}
            variant="outline"
            size="lg"
        className={`${button.color} text-white border-0 hover:scale-105 hover:shadow-medium transition-all duration-200 h-20 flex flex-col gap-2`}
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