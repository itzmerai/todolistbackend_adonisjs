import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Task from '#models/task'
import hash from '@adonisjs/core/services/hash'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/test', async ({ request, response }) => {
  try {
    const body = request.body()
    console.log('Test route - Request body:', body)
    console.log('Test route - Request headers:', request.headers())
    
    return response.json({
      status: 'success',
      message: 'Test route working',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test route error:', error.message)
    return response.status(500).json({
      status: 'error',
      message: 'Test route failed',
      error: error.message
    })
  }
})


router.get('/db-test', async () => {
  try {
    await db.rawQuery('SELECT 1')
    console.log(' Database connected successfully!')
    return {
      status: 'success',
      message: 'Database connected successfully!',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(' Database connection failed:', error.message)
    return {
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
})

router.group(() => {

  router.post('/register', async ({ request, response }) => {
    try {
      const { username, userpassword } = request.only(['username', 'userpassword'])

      if (!username || !userpassword) {
        return response.status(400).json({
          status: 'error',
          message: 'Username and password are required'
        })
      }

      const existingUser = await User.findBy('username', username)
      if (existingUser) {
        return response.status(409).json({
          status: 'error',
          message: 'Username already exists'
        })
      }

      const user = new User()
      user.username = username
      user.userpassword = userpassword
      await user.save()

      console.log(` New user registered: ${username}`)
      return response.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          userId: user.userId,
          username: user.username
        }
      })
    } catch (error) {
      console.error(' Registration failed:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Registration failed',
        error: error.message
      })
    }
  })


  router.post('/login', async ({ request, response }) => {
    try {
      const { username, userpassword } = request.only(['username', 'userpassword'])

   
      console.log('Login attempt - Received data:', { username, userpassword })
      console.log('Login attempt - Request body:', request.body())

      if (!username || !userpassword) {
        return response.status(400).json({
          status: 'error',
          message: 'Username and password are required',
          received: { username, userpassword }
        })
      }

      const user = await User.findBy('username', username)
      console.log('User found:', user ? `User ID: ${user.userId}` : 'No user found')
      
      if (!user) {
        console.log(' Login failed: User not found')
        return response.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        })
      }

      console.log('Verifying password...')
      const isPasswordValid = await hash.verify(user.userpassword, userpassword)
      console.log('Password valid:', isPasswordValid)
      
      if (!isPasswordValid) {
        console.log(' Login failed: Invalid password')
        return response.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        })
      }

      console.log(`User logged in: ${username}`)
      return response.json({
        status: 'success',
        message: 'Login successful',
        data: {
          userId: user.userId,
          username: user.username
        }
      })
    } catch (error) {
      console.error('Login failed:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Login failed',
        error: error.message
      })
    }
  })

  router.get('/users', async ({ response }) => {
    try {
      const users = await User.all()
      return response.json({
        status: 'success',
        data: users.map(user => ({
          userId: user.userId,
          username: user.username
        }))
      })
    } catch (error) {
      console.error('Failed to fetch users:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
        error: error.message
      })
    }
  })


}).prefix('/auth')


router.group(() => {

  router.get('/tasks', async ({ response }) => {
    try {
      const tasks = await Task.query().preload('user')
      return response.json({
        status: 'success',
        data: tasks.map(task => ({
          taskId: task.taskId,
          taskname: task.taskname,
          taskdescription: task.taskdescription,
          userID: task.userID,
          user: task.user ? {
            userId: task.user.userId,
            username: task.user.username
          } : null
        }))
      })
    } catch (error) {
      console.error('Failed to fetch tasks:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch tasks',
        error: error.message
      })
    }
  })


  router.get('/tasks/user/:userID', async ({ params, response }) => {
    try {
      const { userID } = params
      const tasks = await Task.query()
        .where('userID', userID)
        .preload('user')
      
      return response.json({
        status: 'success',
        data: tasks.map(task => ({
          taskId: task.taskId,
          taskname: task.taskname,
          taskdescription: task.taskdescription,
          userID: task.userID,
          user: task.user ? {
            userId: task.user.userId,
            username: task.user.username
          } : null
        }))
      })
    } catch (error) {
      console.error('Failed to fetch user tasks:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch user tasks',
        error: error.message
      })
    }
  })

  router.post('/tasks', async ({ request, response }) => {
    try {
      const { taskname, taskdescription, userID } = request.only(['taskname', 'taskdescription', 'userID'])

      if (!taskname || !userID) {
        return response.status(400).json({
          status: 'error',
          message: 'Task name and user ID are required'
        })
      }


      const user = await User.find(userID)
      if (!user) {
        return response.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }

      const task = new Task()
      task.taskname = taskname
      task.taskdescription = taskdescription || ''
      task.userID = userID
      await task.save()

      console.log(`New task created: ${taskname} for user ${userID}`)
      return response.status(201).json({
        status: 'success',
        message: 'Task created successfully',
        data: {
          taskId: task.taskId,
          taskname: task.taskname,
          taskdescription: task.taskdescription,
          userID: task.userID
        }
      })
    } catch (error) {
      console.error('Task creation failed:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Task creation failed',
        error: error.message
      })
    }
  })


  router.put('/tasks/:taskId', async ({ params, request, response }) => {
    try {
      const { taskId } = params
      const { taskname, taskdescription } = request.only(['taskname', 'taskdescription'])


      const task = await Task.find(taskId)
      if (!task) {
        return response.status(404).json({
          status: 'error',
          message: 'Task not found'
        })
      }

      if (taskname !== undefined) task.taskname = taskname
      if (taskdescription !== undefined) task.taskdescription = taskdescription
      await task.save()

      console.log(`Task updated: ${taskId}`)
      return response.json({
        status: 'success',
        message: 'Task updated successfully',
        data: {
          taskId: task.taskId,
          taskname: task.taskname,
          taskdescription: task.taskdescription,
          userID: task.userID
        }
      })
    } catch (error) {
      console.error('Task update failed:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Task update failed',
        error: error.message
      })
    }
  })


  router.delete('/tasks/:taskId', async ({ params, response }) => {
    try {
      const { taskId } = params

      const task = await Task.find(taskId)
      if (!task) {
        return response.status(404).json({
          status: 'error',
          message: 'Task not found'
        })
      }

      await task.delete()

      console.log(`Task deleted: ${taskId}`)
      return response.json({
        status: 'success',
        message: 'Task deleted successfully'
      })
    } catch (error) {
      console.error('Task deletion failed:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Task deletion failed',
        error: error.message
      })
    }
  })

  router.get('/tasks/:taskId', async ({ params, response }) => {
    try {
      const { taskId } = params
      const task = await Task.query()
        .where('taskId', taskId)
        .preload('user')
        .first()

      if (!task) {
        return response.status(404).json({
          status: 'error',
          message: 'Task not found'
        })
      }

      return response.json({
        status: 'success',
        data: {
          taskId: task.taskId,
          taskname: task.taskname,
          taskdescription: task.taskdescription,
          userID: task.userID,
          user: task.user ? {
            userId: task.user.userId,
            username: task.user.username
          } : null
        }
      })
    } catch (error) {
      console.error('Failed to fetch task:', error.message)
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch task',
        error: error.message
      })
    }
  })
}).prefix('/api')
