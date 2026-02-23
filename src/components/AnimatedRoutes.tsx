import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import Index from '@/pages/Index';
import Photos from '@/pages/Photos';
import ImagesSection from '@/pages/ImagesSection';
import Documents from '@/pages/Documents';
import Notes from '@/pages/Notes';
import Privacy from '@/pages/Privacy';
import Admin from '@/pages/Admin';
import Tools from '@/pages/Tools';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import GroupChats from '@/pages/GroupChats';
import NotFound from '@/pages/NotFound';

export const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Enable swipe-back gesture on mobile
  useSwipeBack({ threshold: 80, edgeWidth: 25 });

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />
        <Route
          path="/photos"
          element={
            <PageTransition>
              <Photos />
            </PageTransition>
          }
        />
        <Route
          path="/images"
          element={
            <PageTransition>
              <ImagesSection />
            </PageTransition>
          }
        />
        <Route
          path="/tools"
          element={
            <PageTransition>
              <Tools />
            </PageTransition>
          }
        />
        <Route
          path="/documents"
          element={
            <PageTransition>
              <Documents />
            </PageTransition>
          }
        />
        <Route
          path="/notes"
          element={
            <PageTransition>
              <Notes />
            </PageTransition>
          }
        />
        <Route
          path="/privacy"
          element={
            <PageTransition>
              <Privacy />
            </PageTransition>
          }
        />
        <Route
          path="/admin"
          element={
            <PageTransition>
              <Admin />
            </PageTransition>
          }
        />
        <Route
          path="/projects"
          element={
            <PageTransition>
              <Projects />
            </PageTransition>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <PageTransition>
              <ProjectDetails />
            </PageTransition>
          }
        />
        <Route
          path="/group-chats"
          element={
            <PageTransition>
              <GroupChats />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};
