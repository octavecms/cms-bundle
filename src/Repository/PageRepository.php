<?php

namespace VideInfra\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Service\PageTreeBuilder;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageRepository extends EntityRepository
{
    /** @var PageTreeBuilder */
    private $treeBuilder;

    /**
     * @param PageTreeBuilder $treeBuilder
     */
    public function setTreeBuilder(PageTreeBuilder $treeBuilder)
    {
        $this->treeBuilder = $treeBuilder;
    }

    /**
     * @return Page
     */
    public function create()
    {
        $page = new Page();
        $this->getEntityManager()->persist($page);

        return $page;
    }

    /**
     * @return array
     */
    public function findActive()
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.active = 1')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return array
     */
    public function getTree()
    {
        $pages = $this->createQueryBuilder('p')
            ->orderBy('p.position', 'ASC')
            ->andWhere('p.parent IS NULL')
            ->getQuery()
            ->getResult();

        $output = [];

        /** @var Page $page */
        foreach ($pages as $page) {
            $output[] = $this->treeBuilder->build($page);
        }

        return $output;
    }
}