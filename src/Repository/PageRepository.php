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
    public function findIncludeInSitemap()
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.active = 1')
            ->andWhere('p.includeInSitemap = 1')
            ->getQuery()
            ->getResult();
    }

    /**
     * @param Page|null $page
     * @param bool $showHidden
     * @return array
     */
    public function getTree(Page $page = null, $showHidden = false)
    {
        if ($page) {
            $pages = $page->getChildren();
        }
        else {
            $pages = $this->createQueryBuilder('p')
                ->orderBy('p.position', 'ASC')
                ->andWhere('p.parent IS NULL')
                ->getQuery()
                ->getResult();
        }

        $output = [];

        /** @var Page $page */
        foreach ($pages as $page) {

            if (!$showHidden && !$page->isIncludeInMenu()) {
                continue;
            }

            $output[] = $this->treeBuilder->build($page, $showHidden);
        }

        return $output;
    }

    /**
     * @param $parent
     * @return int
     */
    public function getNewPosition($parent)
    {
        $queryBuilder = $this->createQueryBuilder('p')
            ->select('MAX(p.position) AS position')
        ;

        if ($parent == 'root' || !$parent) {
            $queryBuilder->andWhere('p.parent IS NULL');
        }
        else {
            $queryBuilder->andWhere('p.parent = :parent')
                ->setParameter('parent', $parent);
        }

        $position = (int) $queryBuilder->getQuery()->getSingleScalarResult()['position'];

        return ++$position;
    }

    /**
     * @param Page $page
     */
    public function increasePositionAfter(Page $page)
    {
        $this->createQueryBuilder('p')
            ->update('VideInfraCMSBundle:Page', 'p')
            ->set('p.position', 'p.position + 1')
            ->andWhere('p.position > :position')
            ->setParameter('position', $page->getPosition())
            ->getQuery()
            ->getResult();
    }
}