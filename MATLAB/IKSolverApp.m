classdef IKSolverApp < matlab.apps.AppBase

    % Properties that correspond to app components
    properties (Access = public)
        UIFigure               matlab.ui.Figure
        XEditField             matlab.ui.control.NumericEditField
        XEditFieldLabel        matlab.ui.control.Label
        YEditField             matlab.ui.control.NumericEditField
        YEditFieldLabel        matlab.ui.control.Label
        ZEditField             matlab.ui.control.NumericEditField
        ZEditFieldLabel        matlab.ui.control.Label
        RollEditField          matlab.ui.control.NumericEditField
        RollEditFieldLabel     matlab.ui.control.Label
        PitchEditField         matlab.ui.control.NumericEditField
        PitchEditFieldLabel    matlab.ui.control.Label
        YawEditField           matlab.ui.control.NumericEditField
        YawEditFieldLabel      matlab.ui.control.Label
        SolveButton            matlab.ui.control.Button
        ResultsTextArea        matlab.ui.control.TextArea
        ResultsTextAreaLabel   matlab.ui.control.Label
        UIAxes                 matlab.ui.control.UIAxes
    end

    properties (Access = private)
        Robot % RigidBodyTree object
        IKSolver % InverseKinematics solver
        JointLimits % Joint angle limits
    end

    methods (Access = private)

        function initializeRobot(app)
            % Define DH parameters [a, alpha, d, theta]
            dhparams = [0, deg2rad(-90), 10, 0;
                        50, 0, 0, deg2rad(-90);
                        0, deg2rad(-90), 5, 0;
                        0, deg2rad(90), 50, 0;
                        0, deg2rad(-90), 0, 0;
                        0, 0, 10, 0];
            
            % Create rigidBodyTree object
            app.Robot = rigidBodyTree;
            bodies = cell(6,1);
            joints = cell(6,1);
            
            % Define joint limits (in degrees)
            app.JointLimits = [
                [-75, 75];     % Joint 1
                [-165, -15];   % Joint 2
                [-75, 75];     % Joint 3
                [-120, 30];    % Joint 4
                [-75, 75];     % Joint 5
                [-120, 30];    % Joint 6
            ];
            
            for i = 1:6
                bodies{i} = rigidBody(['body' num2str(i)]);
                joints{i} = rigidBodyJoint(['joint' num2str(i)],"revolute");
                setFixedTransform(joints{i},dhparams(i,:),"dh");
                
                % Set joint limits
                joints{i}.PositionLimits = deg2rad(app.JointLimits(i,:));
                
                bodies{i}.Joint = joints{i};
                if i == 1
                    addBody(app.Robot, bodies{i}, "base")
                else
                    addBody(app.Robot, bodies{i}, bodies{i-1}.Name)
                end
            end

            % Set up IK solver
            app.IKSolver = inverseKinematics('RigidBodyTree', app.Robot);
        end

        function solveIK(app)
            % Get desired end-effector pose from input fields
            desiredPosition = [app.XEditField.Value; app.YEditField.Value; app.ZEditField.Value];
            desiredOrientation = eul2rotm([deg2rad(app.RollEditField.Value), ...
                                           deg2rad(app.PitchEditField.Value), ...
                                           deg2rad(app.YawEditField.Value)], 'XYZ');
            
            % Combine position and orientation into a single transformation matrix
            desiredPose = [desiredOrientation, desiredPosition; 0 0 0 1];
            
            % Set up IK solver parameters
            weights = [0.25 0.25 0.25 1 1 1]; % Weights for position and orientation
            initialGuess = homeConfiguration(app.Robot);
            
            % Solve IK
            [configSolution, info] = app.IKSolver('body6', desiredPose, weights, initialGuess);
            
            % Check if a solution was found
            if info.ExitFlag > 0
                % Calculate joint angles in degrees
                jointAngles = rad2deg([configSolution.JointPosition]);
                
                % Subtract the specified angles
                angleToSubtract = [-0.00 -90.00 0.00 -45.00 -0.00 -45.00];
                adjustedJointAngles = jointAngles - angleToSubtract;
                
                % Ensure angles are within joint limits
                for i = 1:6
                    adjustedJointAngles(i) = max(min(adjustedJointAngles(i), app.JointLimits(i,2)), app.JointLimits(i,1));
                end
                
                % Format the adjusted joint angles string
                jointAnglesStr = sprintf('[%.2f %.2f %.2f %.2f %.2f %.2f]', adjustedJointAngles);
                
                % Verify the solution with forward kinematics
                T = getTransform(app.Robot, configSolution, 'body6', 'base');
                actualPosition = T(1:3, 4);
                actualRotm = T(1:3, 1:3);
                actualOrientation = rad2deg(rotm2eul(actualRotm, 'XYZ'));
                
                % Calculate errors
                positionError = norm(desiredPosition - actualPosition);
                orientationError = norm(rad2deg(rotm2eul(desiredOrientation'*actualRotm, 'XYZ')));
                
                % Display results
                resultsText = sprintf('Adjusted Joint Angles (degrees):\n%s\n\n', jointAnglesStr);
                resultsText = [resultsText sprintf('Joint Limits (degrees):\n')];
                for i = 1:6
                    resultsText = [resultsText sprintf('Joint %d: [%.2f, %.2f]\n', i, app.JointLimits(i,1), app.JointLimits(i,2))];
                end
                resultsText = [resultsText sprintf('\nActual Position:\n%s\n\n', mat2str(actualPosition, 2))];
                resultsText = [resultsText sprintf('Actual Orientation (XYZ Euler, degrees):\n%s\n\n', mat2str(actualOrientation, 2))];
                resultsText = [resultsText sprintf('Position Error: %.2f units\n', positionError)];
                resultsText = [resultsText sprintf('Orientation Error: %.2f degrees', orientationError)];
                
                app.ResultsTextArea.Value = resultsText;
                
                % Visualize the solution
                app.visualizeRobot(configSolution);
            else
                app.ResultsTextArea.Value = sprintf('No valid solution found.\nExit flag: %d\nError message: %s', ...
                                                    info.ExitFlag, info.ErrorMessage);
            end
        end

        function visualizeRobot(app, config)
            % Clear the current axes
            cla(app.UIAxes);

            % Get transforms for each body
            transforms = cell(1, 6);
            positions = zeros(3, 7);  % 7 points: base + 6 joints
            positions(:, 1) = [0; 0; 0];  % Base position

            for i = 1:6
                transforms{i} = getTransform(app.Robot, config, ['body' num2str(i)], 'base');
                positions(:, i+1) = transforms{i}(1:3, 4);
            end

            % Plot the robot
            plot3(app.UIAxes, positions(1, :), positions(2, :), positions(3, :), 'k-o', 'LineWidth', 2, 'MarkerSize', 6, 'MarkerFaceColor', 'b');

            % Set equal aspect ratio
            axis(app.UIAxes, 'equal');

            % Set axis limits
            maxRange = max(max(abs(positions(:))));
            app.UIAxes.XLim = [-maxRange, maxRange];
            app.UIAxes.YLim = [-maxRange, maxRange];
            app.UIAxes.ZLim = [-maxRange, maxRange];

            % Add labels
            xlabel(app.UIAxes, 'X');
            ylabel(app.UIAxes, 'Y');
            zlabel(app.UIAxes, 'Z');
            title(app.UIAxes, 'Robot Configuration');

            % Enable rotation
            rotate3d(app.UIAxes, 'on');
        end
    end


    % Callbacks that handle component events
    methods (Access = private)

        % Code that executes after component creation
        function startupFcn(app)
            app.initializeRobot();
        end

        % Button pushed function: SolveButton
        function SolveButtonPushed(app, event)
            app.solveIK();
        end
    end

    % Component initialization
    methods (Access = private)

        % Create UIFigure and components
        function createComponents(app)

            % Create UIFigure and hide until all components are created
            app.UIFigure = uifigure('Visible', 'off');
            app.UIFigure.Position = [100 100 640 480];
            app.UIFigure.Name = 'IK Solver';

            % Create XEditFieldLabel
            app.XEditFieldLabel = uilabel(app.UIFigure);
            app.XEditFieldLabel.HorizontalAlignment = 'right';
            app.XEditFieldLabel.Position = [71 431 25 22];
            app.XEditFieldLabel.Text = 'X';

            % Create XEditField
            app.XEditField = uieditfield(app.UIFigure, 'numeric');
            app.XEditField.Position = [111 431 100 22];
            app.XEditField.Value = 60;

            % Create YEditFieldLabel
            app.YEditFieldLabel = uilabel(app.UIFigure);
            app.YEditFieldLabel.HorizontalAlignment = 'right';
            app.YEditFieldLabel.Position = [71 400 25 22];
            app.YEditFieldLabel.Text = 'Y';

            % Create YEditField
            app.YEditField = uieditfield(app.UIFigure, 'numeric');
            app.YEditField.Position = [111 400 100 22];
            app.YEditField.Value = 5;

            % Create ZEditFieldLabel
            app.ZEditFieldLabel = uilabel(app.UIFigure);
            app.ZEditFieldLabel.HorizontalAlignment = 'right';
            app.ZEditFieldLabel.Position = [71 369 25 22];
            app.ZEditFieldLabel.Text = 'Z';

            % Create ZEditField
            app.ZEditField = uieditfield(app.UIFigure, 'numeric');
            app.ZEditField.Position = [111 369 100 22];
            app.ZEditField.Value = 60;

            % Create RollEditFieldLabel
            app.RollEditFieldLabel = uilabel(app.UIFigure);
            app.RollEditFieldLabel.HorizontalAlignment = 'right';
            app.RollEditFieldLabel.Position = [61 338 35 22];
            app.RollEditFieldLabel.Text = 'Roll';

            % Create RollEditField
            app.RollEditField = uieditfield(app.UIFigure, 'numeric');
            app.RollEditField.Position = [111 338 100 22];
            app.RollEditField.Value = 0;

            % Create PitchEditFieldLabel
            app.PitchEditFieldLabel = uilabel(app.UIFigure);
            app.PitchEditFieldLabel.HorizontalAlignment = 'right';
            app.PitchEditFieldLabel.Position = [56 307 40 22];
            app.PitchEditFieldLabel.Text = 'Pitch';

            % Create PitchEditField
            app.PitchEditField = uieditfield(app.UIFigure, 'numeric');
            app.PitchEditField.Position = [111 307 100 22];
            app.PitchEditField.Value = 90;

            % Create YawEditFieldLabel
            app.YawEditFieldLabel = uilabel(app.UIFigure);
            app.YawEditFieldLabel.HorizontalAlignment = 'right';
            app.YawEditFieldLabel.Position = [61 276 35 22];
            app.YawEditFieldLabel.Text = 'Yaw';

            % Create YawEditField
            app.YawEditField = uieditfield(app.UIFigure, 'numeric');
            app.YawEditField.Position = [111 276 100 22];
            app.YawEditField.Value = 90;

            % Create SolveButton
            app.SolveButton = uibutton(app.UIFigure, 'push');
            app.SolveButton.ButtonPushedFcn = createCallbackFcn(app, @SolveButtonPushed, true);
            app.SolveButton.Position = [111 235 100 22];
            app.SolveButton.Text = 'Solve IK';

            % Create ResultsTextAreaLabel
            app.ResultsTextAreaLabel = uilabel(app.UIFigure);
            app.ResultsTextAreaLabel.HorizontalAlignment = 'right';
            app.ResultsTextAreaLabel.Position = [51 204 45 22];
            app.ResultsTextAreaLabel.Text = 'Results';

            % Create ResultsTextArea
            app.ResultsTextArea = uitextarea(app.UIFigure);
            app.ResultsTextArea.Position = [111 84 200 143];

            % Create UIAxes
            app.UIAxes = uiaxes(app.UIFigure);
            title(app.UIAxes, 'Robot Configuration')
            xlabel(app.UIAxes, 'X')
            ylabel(app.UIAxes, 'Y')
            zlabel(app.UIAxes, 'Z')
            app.UIAxes.Position = [321 84 300 369];

            % Show the figure after all components are created
            app.UIFigure.Visible = 'on';
            grid(app.UIAxes, 'on');
        end
    end

    % App creation and deletion
    methods (Access = public)

        % Construct app
        function app = IKSolverApp

            % Create UIFigure and components
            createComponents(app)

            % Register the app with App Designer
            registerApp(app, app.UIFigure)

            % Execute the startup function
            runStartupFcn(app, @startupFcn)

            if nargout == 0
                clear app
            end
        end

        % Code that executes before app deletion
        function delete(app)

            % Delete UIFigure when app is deleted
            delete(app.UIFigure)
        end
    end
end