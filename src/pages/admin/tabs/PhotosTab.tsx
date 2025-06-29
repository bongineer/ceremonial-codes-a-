import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import PhotoGallery from '../../../components/gallery/PhotoGallery';

const PhotosTab: React.FC = () => {
  const { state, addGalleryPhoto, removeGalleryPhoto, updateSettings } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [guestPhotosLink, setGuestPhotosLink] = useState(state.settings.guestPhotosLink || '');
  
  const handleAddPhoto = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    addGalleryPhoto({
      title: title.trim() || '',
      imageUrl: imageUrl.trim(),
      type
    });
    
    // Clear form
    setTitle('');
    setImageUrl('');
    
    toast.success(`${type === 'image' ? 'Photo' : 'Video'} added to gallery!`);
  };
  
  const handleDeletePhoto = (index: number) => {
    removeGalleryPhoto(index);
    toast.success('Item removed from gallery');
  };

  const handleSaveGuestPhotosLink = () => {
    updateSettings({ guestPhotosLink: guestPhotosLink.trim() });
    toast.success('Guest photos link saved!');
  };
  
  return (
    <div>
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Upload Media</h3>
        <p className="mb-4 text-theme-text">Add images and videos to your wedding gallery for guests to view.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="media-title" className="block text-theme-text mb-2">Title (Optional)</label>
            <input 
              type="text" 
              id="media-title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
              placeholder="Enter a title (optional)"
            />
          </div>
          
          <div>
            <label htmlFor="media-type" className="block text-theme-text mb-2">Type</label>
            <select 
              id="media-type" 
              value={type}
              onChange={(e) => setType(e.target.value as 'image' | 'video')}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="media-url" className="block text-theme-text mb-2">
            {type === 'image' ? 'Image URL' : 'Video URL'}
          </label>
          <input 
            type="text" 
            id="media-url" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder={`Enter a URL for the ${type}`}
          />
        </div>
        
        <button 
          onClick={handleAddPhoto}
          className="mt-4 bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
        >
          Add {type === 'image' ? 'Photo' : 'Video'}
        </button>
      </div>

      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Guest Photos Link</h3>
        <p className="mb-4 text-theme-text">Add a link where guests can view or upload their own photos from the wedding.</p>
        
        <div className="flex gap-4">
          <input 
            type="text" 
            value={guestPhotosLink}
            onChange={(e) => setGuestPhotosLink(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter guest photos link (e.g., Google Photos, Dropbox, etc.)"
          />
          <button 
            onClick={handleSaveGuestPhotosLink}
            className="bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
          >
            Save Link
          </button>
        </div>
      </div>
      
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Manage Gallery</h3>
        
        <PhotoGallery 
          photos={state.gallery} 
          onDelete={handleDeletePhoto}
          isAdmin
        />
      </div>
    </div>
  );
};

export default PhotosTab;