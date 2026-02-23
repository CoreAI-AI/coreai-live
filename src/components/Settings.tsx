import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, User as UserIcon, Monitor, Moon, Sun, Palette, Brain, 
  Volume2, Database, Shield, LogOut, Trash2, Download, History,
  Type, LayoutGrid, Sparkles, FileText, AlertTriangle, Lock, Fingerprint
} from "lucide-react";
import { UserSettings, useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportChatAsText, exportChatAsPDF } from "@/lib/exportChat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { useAppLock } from "@/hooks/useAppLock";

interface SettingsProps {
  user: User | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const Settings = ({ user }: SettingsProps) => {
  const { settings, updateSettings } = useSettings(user?.id);
  const { theme, setTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const appLock = useAppLock();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalSettings(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success("Settings saved successfully!");
  };

  const getUserInitials = () => {
    if (localSettings.displayName) {
      return localSettings.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance("This is a test of the selected voice.");
    const voice = voices.find(v => v.name === localSettings.selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = localSettings.speechRate;
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = async () => {
    if (user) {
      try {
        await supabase.from('messages').delete().eq('chat_id', user.id);
        await supabase.from('chats').delete().eq('user_id', user.id);
        toast.success("Chat history cleared successfully!");
      } catch (error) {
        toast.error("Failed to clear chat history");
      }
    } else {
      localStorage.removeItem('demo_chats');
      localStorage.removeItem('demo_messages');
      toast.success("Chat history cleared!");
    }
  };

  const handleSignOutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success("Signed out from all devices");
    } catch (error) {
      toast.error("Failed to sign out from all devices");
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Please contact support to delete your account");
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto pb-8">
      {/* Profile Card */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                <AvatarImage src={localSettings.profilePicture} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <p className="font-medium text-base">
                  {localSettings.displayName || 'Set your name'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'demo@example.com'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('profile-picture')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm">Display Name</Label>
              <Input
                id="display-name"
                value={localSettings.displayName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Enter your display name"
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Theme */}
            <div className="space-y-2">
              <Label className="text-sm">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={theme === value ? "default" : "outline"}
                    onClick={() => setTheme(value)}
                    className="flex flex-col items-center gap-1.5 h-auto py-3"
                    size="sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Type className="w-4 h-4" />
                Font Size
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={localSettings.fontSize === size ? "default" : "outline"}
                    onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: size }))}
                    size="sm"
                    className="capitalize"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Chat Density */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Chat Density
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(['comfortable', 'compact'] as const).map((density) => (
                  <Button
                    key={density}
                    variant={localSettings.chatDensity === density ? "default" : "outline"}
                    onClick={() => setLocalSettings(prev => ({ ...prev, chatDensity: density }))}
                    size="sm"
                    className="capitalize"
                  >
                    {density}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Preferences */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5" />
              AI Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Default Model */}
            <div className="space-y-2">
              <Label className="text-sm">Default Model</Label>
              <Select
                value={localSettings.defaultModel}
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, defaultModel: value }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Response Length */}
            <div className="space-y-2">
              <Label className="text-sm">Response Length</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['short', 'balanced', 'detailed'] as const).map((length) => (
                  <Button
                    key={length}
                    variant={localSettings.responseLength === length ? "default" : "outline"}
                    onClick={() => setLocalSettings(prev => ({ ...prev, responseLength: length }))}
                    size="sm"
                    className="capitalize"
                  >
                    {length}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Creativity Level */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Creativity Level
                </Label>
                <span className="text-sm text-muted-foreground">{localSettings.creativityLevel}%</span>
              </div>
              <Slider
                value={[localSettings.creativityLevel]}
                onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, creativityLevel: value }))}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Voice & Audio */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="w-5 h-5" />
              Voice & Audio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Voice Input */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Voice Input</Label>
                <p className="text-xs text-muted-foreground">Enable microphone for voice messages</p>
              </div>
              <Switch
                checked={localSettings.voiceInputEnabled}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, voiceInputEnabled: checked }))}
              />
            </div>

            <Separator />

            {/* Text-to-Speech */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Text-to-Speech</Label>
                <p className="text-xs text-muted-foreground">Read AI responses aloud</p>
              </div>
              <Switch
                checked={localSettings.textToSpeechEnabled}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, textToSpeechEnabled: checked }))}
              />
            </div>


            {localSettings.textToSpeechEnabled && (
              <>
                <Separator />
                
                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label className="text-sm">Voice Selection</Label>
                  <Select
                    value={localSettings.selectedVoice}
                    onValueChange={(value) => setLocalSettings(prev => ({ ...prev, selectedVoice: value }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speech Speed */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Speech Speed</Label>
                    <span className="text-sm text-muted-foreground">{localSettings.speechRate}x</span>
                  </div>
                  <Slider
                    value={[localSettings.speechRate]}
                    onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, speechRate: value }))}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <Button onClick={testVoice} variant="outline" size="sm" className="w-full">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Voice
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Data & History */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5" />
              Data & History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Auto-save */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Auto-save Conversations</Label>
                <p className="text-xs text-muted-foreground">Automatically save chat history</p>
              </div>
              <Switch
                checked={localSettings.autoSaveConversations}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, autoSaveConversations: checked }))}
              />
            </div>

            <Separator />

            {/* Export Chats */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Chats
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Export TXT
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <Separator />

            {/* Clear History */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive">
                  <History className="w-4 h-4 mr-2" />
                  Clear Chat History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your chat history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Lock */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.23 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5" />
              App Lock
            </CardTitle>
            <CardDescription>
              Protect your app with PIN or fingerprint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Enable App Lock */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Enable App Lock</Label>
                <p className="text-xs text-muted-foreground">
                  Require PIN to access app
                </p>
              </div>
              {appLock.settings.enabled ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Switch checked={true} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disable App Lock?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the PIN protection from your app.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={appLock.disableLock}>
                        Disable
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Switch 
                  checked={false} 
                  onCheckedChange={() => appLock.setIsSetupMode(true)} 
                />
              )}
            </div>

            {appLock.settings.enabled && (
              <>
                <Separator />

                {/* Biometric Authentication */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm">Fingerprint / Face ID</Label>
                      <p className="text-xs text-muted-foreground">
                        Use biometric to unlock
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={appLock.settings.biometricEnabled}
                    onCheckedChange={appLock.toggleBiometric}
                  />
                </div>

                <Separator />

                {/* Lock Timeout */}
                <div className="space-y-2">
                  <Label className="text-sm">Auto-lock after</Label>
                  <Select
                    value={String(appLock.settings.lockAfterMinutes)}
                    onValueChange={(value) => appLock.setLockTimeout(Number(value))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Lock Now Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={appLock.lockApp}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Lock App Now
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Data Usage Info */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm font-medium">Data Usage</p>
              <p className="text-xs text-muted-foreground">
                Your conversations are stored securely and used to improve your experience. 
                We don't share your data with third parties.
              </p>
            </div>

            <Separator />

            {/* Sign Out All Devices */}
            {user && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out from All Devices
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign Out Everywhere?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will sign you out from all devices including this one.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSignOutAll}>
                        Sign Out All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Separator />
              </>
            )}

            {/* Delete Account */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Delete Account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible" 
        transition={{ delay: 0.3 }}
        className="sticky bottom-4 pt-2"
      >
        <Button onClick={handleSave} className="w-full h-11 font-medium shadow-lg">
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
};
