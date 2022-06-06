<?php

namespace Octave\CMSBundle\Command;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Octave\CMSBundle\Repository\PageRepository;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class CreatePageCommand extends Command
{
    /**
     * @var EntityManager
     */
    private $entityManager;

    /**
     * @var PageRepository
     */
    private $repository;

    /**
     * CreatePageCommand constructor.
     * @param EntityManager $em
     * @param PageRepository $repository
     */
    public function __construct(EntityManager $em, PageRepository $repository)
    {
        $this->entityManager = $em;
        $this->repository = $repository;
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('octave:page:create')
            ->setDefinition(
                [
                    new InputArgument('name', InputArgument::REQUIRED, 'The name'),
                    new InputArgument('path', InputArgument::REQUIRED, 'The path to page'),
                    new InputArgument('controller', InputArgument::REQUIRED, 'Thr Controller'),
                ]
            )
        ;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $name = $input->getArgument('name');
        $path = $input->getArgument('path');
        $controller = $input->getArgument('controller');

        $page = $this->repository->create();
        $page->setActive(true);
        $page->setName($name);
        $page->setPath($path);
        $page->setController($controller);

        $this->entityManager->flush();

        $output->writeln('The page with path <info>' . $path . '</info> successfully created');

        return 0;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     */
    protected function interact(InputInterface $input, OutputInterface $output)
    {
        $questions = array();

        if (!$input->getArgument('name')) {
            $question = new Question('Please choose a name: ');
            $question->setValidator(function ($name) {
                if (empty($name)) {
                    throw new \Exception('Name can not be empty');
                }

                $found = $this->repository->findOneBy(['name' => $name]);
                if ($found) {
                    throw new \Exception('This name is already used');
                }

                return $name;
            });
            $questions['name'] = $question;
        }

        if (!$input->getArgument('path')) {
            $question = new Question('Please choose a path: ');
            $question->setValidator(function ($path) {
                if (empty($path)) {
                    throw new \Exception('Path can not be empty');
                }

                $found = $this->repository->findOneBy(['path' => $path]);
                if ($found) {
                    throw new \Exception('The path must be unique');
                }

                return $path;
            });
            $questions['path'] = $question;
        }

        if (!$input->getArgument('controller')) {
            $question = new Question('Please choose a controller: ');
            $question->setValidator(function ($controller) {
                if (empty($controller)) {
                    throw new \Exception('Controller can not be empty');
                }

                return $controller;
            });
            $questions['controller'] = $question;
        }

        foreach ($questions as $name => $question) {
            $answer = $this->getHelper('question')->ask($input, $output, $question);
            $input->setArgument($name, $answer);
        }
    }
}