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
  Briefcase,
  Calendar,
  Brain,
  Sparkles,
  Hand,
  Play,
  Cloud,
  Layers,
  Factory,
  Linkedin,
  DollarSign
} from "lucide-react";

interface LaunchButton {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const launchButtons: LaunchButton[] = [
  // Google Apps
  { name: "Gmail", url: "https://mail.google.com/a/dobbles.ai", icon: <Mail size={24} />, color: "bg-primary" },
  { name: "Google Chat", url: "https://chat.google.com/u/?authuser=ed@dobbles.ai", icon: <MessageCircle size={24} />, color: "bg-accent" },
  { name: "Google Meet", url: "https://meet.google.com/u/?authuser=ed@dobbles.ai", icon: <Video size={24} />, color: "bg-gradient-brand" },
  { name: "Google Calendar", url: "https://calendar.google.com/a/dobbles.ai", icon: <Calendar size={24} />, color: "bg-secondary" },
  { name: "Google Drive", url: "https://drive.google.com/a/dobbles.ai", icon: <HardDrive size={24} />, color: "bg-accent" },
  { name: "Google Docs", url: "https://docs.google.com/document/u/?authuser=ed@dobbles.ai", icon: <FileText size={24} />, color: "bg-primary" },
  { name: "Google Sheets", url: "https://docs.google.com/spreadsheets/u/?authuser=ed@dobbles.ai", icon: <FileSpreadsheet size={24} />, color: "bg-secondary" },
  { name: "Google Slides", url: "https://docs.google.com/presentation/u/?authuser=ed@dobbles.ai", icon: <Presentation size={24} />, color: "bg-gradient-navy" },
  { name: "Google Cloud Console", url: "https://console.cloud.google.com/welcome/new?_gl=1*1qa0vav*_up*MQ..&gclid=Cj0KCQiAnJHMBhDAARIsABr7b86Kz6LeS_urkTlGDxsY1xenpLJgdgWf9NIK4hy7Em9vQ1RBeWTgh9gaAoq0EALw_wcB&gclsrc=aw.ds&rapt=AEjHL4OqASXmfrkx42UUzxcFTeoSEbXL9CMHTM2gEU9gkb8bPBGqA44Xr5iAufHHcBeWYu9uO5qAQY4cJt4mdVgqaLerrSuKST1PchOUR31CgeV8tvRH_Ww&project=gen-lang-client-0993049784", icon: <Cloud size={24} />, color: "bg-accent" },
  // AI Tools
  { name: "ChatGPT", url: "https://chat.openai.com", icon: <MessageSquare size={24} />, color: "bg-primary" },
  { name: "Claude", url: "https://claude.ai", icon: <Bot size={24} />, color: "bg-secondary" },
  { name: "Google Gemini", url: "https://gemini.google.com", icon: <Sparkles size={24} />, color: "bg-gradient-brand" },
  { name: "Lovable", url: "https://lovable.dev", icon: <Code2 size={24} />, color: "bg-gradient-brand" },
  // Productivity Apps
  { name: "n8n", url: "https://n8n.io", icon: <Workflow size={24} />, color: "bg-accent" },
  { name: "Upwork", url: "https://upwork.com", icon: <Briefcase size={24} />, color: "bg-gradient-brand" },
  { name: "Overproof Agent", url: "https://overproof-agent.ai", icon: <Hand size={24} />, color: "bg-secondary" },
  { name: "HeyGen", url: "https://app.heygen.com/home", icon: <Play size={24} />, color: "bg-gradient-brand" },
  { name: "Gamma", url: "https://gamma.app/create", icon: <Layers size={24} />, color: "bg-primary" },
  { name: "Factory", url: "https://app.factory.ai/sessions", icon: <Factory size={24} />, color: "bg-secondary" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/ed-dobbles/", icon: <Linkedin size={24} />, color: "bg-accent" },
  { name: "AnswerRocket", url: "https://overproof.prod.answerrocket.com", icon: <Brain size={24} />, color: "bg-gradient-navy" },
  { name: "Cost Tracker", url: "https://web-production-ed8e5.up.railway.app", icon: <DollarSign size={24} />, color: "bg-gradient-brand" },
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