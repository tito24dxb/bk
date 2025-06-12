import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Admin profile data
const adminData = {
  name: 'Cristian Rolando Dorao',
  email: 'crisdoraodxb@gmail.com',
  phone: '+522227286001',
  role: 'admin',
  profilePic: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  permissions: ['manage_investors', 'manage_withdrawals', 'view_analytics', 'system_settings'],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const createAdminAccount = async () => {
  try {
    console.log('Checking if admin account exists...');
    
    // Check if email is already registered
    const signInMethods = await fetchSignInMethodsForEmail(auth, adminData.email);
    
    if (signInMethods.length > 0) {
      console.log('✅ Admin account already exists');
      console.log('📧 Email:', adminData.email);
      
      // Try to sign in with the new password to verify it works
      try {
        await signInWithEmailAndPassword(auth, adminData.email, 'Messi24@');
        console.log('✅ New password "Messi24@" works - account is ready to use');
        
        return {
          success: true,
          message: 'Admin account already exists and is ready to use with new password'
        };
      } catch (signInError: any) {
        if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/wrong-password') {
          console.log('⚠️  Admin account exists but password is not "Messi24@"');
          console.log('🔧 To update the password:');
          console.log('   1. Go to Firebase Console > Authentication > Users');
          console.log('   2. Find the user with email:', adminData.email);
          console.log('   3. Click on the user and select "Reset password"');
          console.log('   4. Set the new password to: Messi24@');
          
          return {
            success: false,
            message: 'Admin account exists but password needs to be updated to "Messi24@" in Firebase Console'
          };
        } else {
          throw signInError;
        }
      }
    }
    
    console.log('Creating new admin account...');
    
    try {
      // Create authentication account with new password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminData.email, 
        'Messi24@' // Updated password
      );
      
      const user = userCredential.user;
      console.log('Firebase Auth user created:', user.uid);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), adminData);
      console.log('Admin profile created in Firestore');
      
      console.log('✅ Admin account created successfully!');
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password: Messi24@');
      console.log('⚠️  Please keep this password secure');
      
      return {
        success: true,
        uid: user.uid,
        email: adminData.email,
        message: 'Admin account created successfully with new password'
      };
      
    } catch (createError: any) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('✅ Admin account already exists (detected during creation)');
        console.log('📧 Email:', adminData.email);
        console.log('ℹ️  Account is ready to use');
        
        return {
          success: true,
          message: 'Admin account already exists and is ready to use'
        };
      } else {
        throw createError;
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error with admin account:', error);
    
    return {
      success: false,
      message: error.message
    };
  }
};

// Function to call from browser console
(window as any).createAdminAccount = createAdminAccount;