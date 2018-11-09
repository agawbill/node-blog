# node-blog
This is a simple blog app that I created using the Node.js runtime and the Express Node framework. I wanted to demonstrate proficiency performing CRUD (using Node),  utilizing Mongoose,  MongoDB (through mLab), creating models, views, routes, an image uploader, implementing a rich text editor (TinyMCE), etc.  I also utilized a number of AWS services when creating this app (Cognito for the user verification, images are uploaded by users to an S3 bucket, and it was deployed using Elastic Beanstalk).



<h2>Guest login</h2><br>

<b>URL to login:</b> http://nodeblog-env.jw9p8rcwmp.us-east-1.elasticbeanstalk.com/login

<b>Username:</b> CognitoGuest1@gmail.com<br>
(username is case sensitive)<br>

<b>Password:</b> Password1!

<h2>Highlights</h2>

- Use of Amazon Cognito for authentication (users can sign up, sign in using AWS Cognito).
- Users can create, delete, update blog posts.
- Rich text editor (tinyMCE) implemented. Users can adjust text alignment, font weight, style and size. Users can add code snippets, and add pictures to posts (and adjust scaling) as long as they have a URL for that image (see next point below). 
- I created an image uploader that connects to an S3 bucket. Images are uploaded to the bucket, and URL, title, and username are simultaneously saved to MongoDB (I created a Picture model). 
- Images are uploaded using an AJAX post request, and the most recent image is added to the "Recent Images" column in the uploader (no page refresh).., that "Recent Images" column displays the titles of the last 5 images a user has uploaded, with the most recent one up top and made bold. 
- Next to each title, there's a copy icon that a user can click that will automatically copy the URL of the image (that's hidden) to a user's clipboard. User can use that URL to post an image through tinyMCE editor.  
- On user dashboard, there's a column with a user's most recent posts. It displays the titles of the last 5 with options to edit or delete them... if user has more than 5 posts, a "More Posts" button will appear that a user can click to display 5 more posts, and user can continue to click button (displaying more posts each time) until all user posts are displayed.
- Use of mongoose, MongoDB (through mLab), Express, EJS.
- Deployed using Elastic Beanstalk on AWS.
