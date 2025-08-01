import PageHeader from '@/components/ui/ReusableComponents/PageHeader';
import { Webcam, GitFork, Users, Brain, Target, Palette } from 'lucide-react';
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { leadData } from './__tests__/data';

const page = () => {
  return (
    <div className="w-full h-screen flex flex-col px-6 md:px-8 lg:px-10 xl:px-12 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20">
          <Brain className="w-16 h-16 text-purple-600 rotate-12" />
        </div>
        <div className="absolute top-40 right-32">
          <Target className="w-12 h-12 text-pink-600 -rotate-12" />
        </div>
        <div className="absolute bottom-40 right-20">
          <Palette className="w-18 h-18 text-indigo-500 -rotate-12" />
        </div>
      </div>
      
      <div className="relative z-10">
      <div className="w-full flex flex-col">
        <PageHeader
          leftIcon={<Webcam className="w-3 h-3" />}
          mainIcon={<Users className="w-12 h-12 text-purple-600 dark:text-purple-400" />}
          rightIcon={<GitFork className="w-3 h-3" />}
          heading="Cultural Intelligence for All Your Prospects"
          placeholder="Search prospects..."
        />
      </div>

      <div className="flex-grow overflow-y-auto mt-6"> 
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm text-muted-foreground">Name</TableHead>
              <TableHead className="text-sm text-muted-foreground">Email</TableHead>
              <TableHead className="text-sm text-muted-foreground">Cultural Profile</TableHead>
              <TableHead className="text-right text-sm text-muted-foreground">Sales Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leadData?.map((lead, idx) => (
              <TableRow key={idx} className="border-0">
                <TableCell className="font-medium">{lead?.name}</TableCell>
                <TableCell>{lead?.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Cultural Profile Available
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {lead?.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  );
};

export default page;
