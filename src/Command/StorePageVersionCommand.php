<?php

namespace Octave\CMSBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class StorePageVersionCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('octave:cms:store-page')
            ->addArgument('page', InputArgument::REQUIRED)
            ->addArgument('version', InputArgument::OPTIONAL)
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $pageId = $input->getArgument('page');
        $version = $input->getArgument('version');

        $pageRepository = $this->getContainer()->get('octave.cms.page.repository');

        $page = $pageRepository->find($pageId);
        if (!$page) {
            throw new \Exception(sprintf('Unable to find page with id %s', $pageId));
        }

        $versionManager = $this->getContainer()->get('octave.cms.page.version.manager');
        $versionManager->storeVersion($page, $version);
    }
}